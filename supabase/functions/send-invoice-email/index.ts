import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// PDF generation removed - email sends HTML directly

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendInvoiceRequest {
  invoiceId: string;
  recipientEmail: string;
}

// Helper to draw text with proper encoding
const drawText = (page: any, text: string, x: number, y: number, options: any) => {
  const safeText = (text || '').replace(/[^\x20-\x7E\u00C0-\u00FF]/g, '');
  try {
    page.drawText(safeText, { x, y, ...options });
  } catch {
    const asciiText = (text || '').replace(/[^\x20-\x7E]/g, '');
    page.drawText(asciiText, { x, y, ...options });
  }
};

// Helper to truncate text to fit width
const truncateText = (text: string, font: any, fontSize: number, maxWidth: number): string => {
  let t = text || '';
  while (t.length > 0) {
    try {
      const w = font.widthOfTextAtSize(t, fontSize);
      if (w <= maxWidth) return t;
      t = t.slice(0, -1);
    } catch {
      t = t.slice(0, -1);
    }
  }
  return '';
};

const textWidth = (text: string, font: any, fontSize: number): number => {
  try {
    return font.widthOfTextAtSize(text || '', fontSize);
  } catch {
    return 0;
  }
};

const stripAccents = (str: string): string => {
  return (str || '').replace(/[^\x20-\x7E]/g, (c: string) => {
    const map: Record<string, string> = {
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'à': 'a', 'â': 'a', 'ä': 'a',
      'ô': 'o', 'ö': 'o',
      'û': 'u', 'ù': 'u', 'ü': 'u',
      'î': 'i', 'ï': 'i',
      'ç': 'c',
      'É': 'E', 'È': 'E', 'Ê': 'E',
      'À': 'A', 'Â': 'A',
      'Ô': 'O', 'Û': 'U', 'Î': 'I',
      'Ç': 'C',
    };
    return map[c] || c;
  });
};

// Fetch and embed logo into PDF
const embedLogo = async (pdfDoc: any, logoUrl: string | null): Promise<any | null> => {
  if (!logoUrl) return null;
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('png') || logoUrl.toLowerCase().endsWith('.png')) {
      return await pdfDoc.embedPng(bytes);
    } else if (contentType.includes('jpeg') || contentType.includes('jpg') || logoUrl.toLowerCase().endsWith('.jpg') || logoUrl.toLowerCase().endsWith('.jpeg')) {
      return await pdfDoc.embedJpg(bytes);
    }
    // Try png first, then jpg
    try { return await pdfDoc.embedPng(bytes); } catch { /* ignore */ }
    try { return await pdfDoc.embedJpg(bytes); } catch { /* ignore */ }
    return null;
  } catch (e) {
    console.log('[PDF] Could not embed logo:', e);
    return null;
  }
};


const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invoiceId, recipientEmail }: SendInvoiceRequest = await req.json();

    if (!invoiceId || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "invoiceId and recipientEmail are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch center info
    const { data: center } = await supabase
      .from("centers")
      .select("name, email, phone, address, logo_url")
      .eq("id", invoice.center_id)
      .single();

    // Fetch invoice items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("sort_order");

    const isInvoice = invoice.type === "invoice";
    const isQuote = invoice.type === "quote";
    const docType = isInvoice ? "Facture" : "Devis";

    console.log(`[SEND-INVOICE-EMAIL] Generating PDF for ${docType} ${invoice.number}`);

    // Generate PDF
    const pdfBytes = await generateInvoicePdf(invoice, items || [], center);
    
    // Convert to base64 for Resend attachment
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

    console.log(`[SEND-INVOICE-EMAIL] PDF generated, size: ${pdfBytes.length} bytes`);

    // Build acceptance button HTML for quotes
    let acceptButtonHtml = '';
    if (isQuote && invoice.acceptance_token) {
      const appUrl = "https://valet-reserve-pro.lovable.app";
      const acceptUrl = `${appUrl}/accept-quote?token=${invoice.acceptance_token}`;
      
      acceptButtonHtml = `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${acceptUrl}" 
             style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            &#10003; Accepter ce devis
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
            En cliquant sur ce bouton, vous acceptez le devis ${invoice.number}
          </p>
        </div>
      `;
    }

    // Build items rows HTML
    const itemsRowsHtml = (items || []).map((item: any, idx: number) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      return `
        <tr style="background: ${bgColor};">
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb;">${item.description || ''}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity || 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${(item.unit_price || 0).toFixed(2)}&#8364;</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.vat_rate || 0}%</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${(item.subtotal || 0).toFixed(2)}&#8364;</td>
        </tr>
      `;
    }).join('');

    // Build email HTML matching the preview layout exactly
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 40px 20px; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          
          <!-- Header: Logo + Company Info | Doc Type -->
          <div style="padding: 32px 32px 0 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; width: 60%;">
                  ${center?.logo_url ? `<img src="${center.logo_url}" alt="${center?.name || ''}" style="max-height: 56px; max-width: 160px; object-fit: contain; border-radius: 10px; margin-bottom: 12px; display: block;" />` : ''}
                  <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #111827;">${center?.name || ''}</p>
                  ${center?.address ? `<p style="margin: 0 0 2px; font-size: 12px; color: #6b7280; line-height: 1.5;">${center.address}</p>` : ''}
                  ${center?.phone ? `<p style="margin: 0 0 2px; font-size: 12px; color: #6b7280;">T&eacute;l: ${center.phone}</p>` : ''}
                  ${center?.email ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">${center.email}</p>` : ''}
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <p style="margin: 0 0 6px; font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">${docType.toUpperCase()}</p>
                  <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #111827;">${invoice.number}</p>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  ${isInvoice && invoice.due_date ? `<p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">&Eacute;ch&eacute;ance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>` : ''}
                  ${!isInvoice && invoice.valid_until ? `<p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Valable jusqu'au: ${new Date(invoice.valid_until).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>` : ''}
                </td>
              </tr>
            </table>
          </div>

          <!-- Client Box -->
          <div style="padding: 24px 32px;">
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
              <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; font-weight: 600;">${isInvoice ? 'FACTUR&Eacute; &Agrave;' : 'DEVIS POUR'}</p>
              <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #111827;">${invoice.client_name}</p>
              ${invoice.client_address ? `<p style="margin: 0 0 2px; font-size: 12px; color: #6b7280;">${invoice.client_address}</p>` : ''}
              ${invoice.client_phone ? `<p style="margin: 0 0 2px; font-size: 12px; color: #6b7280;">T&eacute;l: ${invoice.client_phone}</p>` : ''}
              ${invoice.client_email ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">${invoice.client_email}</p>` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <div style="padding: 0 32px;">
            <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827; text-align: left;">Description</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827; text-align: center; width: 50px;">Qt&eacute;</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827; text-align: right; width: 90px;">Prix HT</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827; text-align: right; width: 60px;">TVA</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827; text-align: right; width: 100px;">Total HT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="padding: 20px 32px 0;">
            <table style="width: 260px; margin-left: auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Sous-total HT</td>
                <td style="padding: 4px 0; font-size: 13px; color: #111827; text-align: right; font-weight: 500;">${invoice.subtotal.toFixed(2)}&#8364;</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">TVA</td>
                <td style="padding: 4px 0; font-size: 13px; color: #111827; text-align: right; font-weight: 500;">${invoice.total_vat.toFixed(2)}&#8364;</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 0;"><div style="border-top: 2px solid #e5e7eb; margin: 8px 0;"></div></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 16px; font-weight: 700; color: #111827;">Total TTC</td>
                <td style="padding: 4px 0; font-size: 16px; font-weight: 800; color: #111827; text-align: right;">${invoice.total.toFixed(2)}&#8364;</td>
              </tr>
            </table>
          </div>

          ${acceptButtonHtml}

          ${invoice.notes ? `
          <div style="padding: 16px 32px 0;">
            <p style="margin: 0 0 4px; font-size: 10px; text-transform: uppercase; color: #9ca3af; font-weight: 600;">Notes</p>
            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5; white-space: pre-wrap;">${invoice.notes}</p>
          </div>
          ` : ''}

          ${invoice.terms ? `
          <div style="padding: 12px 32px 0;">
            <p style="margin: 0 0 4px; font-size: 10px; text-transform: uppercase; color: #9ca3af; font-weight: 600;">Conditions de paiement</p>
            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5; white-space: pre-wrap;">${invoice.terms}</p>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="padding: 24px 32px; margin-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 4px; font-size: 11px; color: #9ca3af;">${center?.name || ''} ${center?.address ? `&bull; ${center.address}` : ''}</p>
            <p style="margin: 0; font-size: 11px; color: #9ca3af;">${isInvoice ? "En cas de retard de paiement, une p&eacute;nalit&eacute; de 3 fois le taux d'int&eacute;r&ecirc;t l&eacute;gal sera appliqu&eacute;e." : "Ce devis est valable 30 jours &agrave; compter de sa date d'&eacute;mission."}</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${center?.name || "Facturation"} <noreply@cleaningpage.com>`,
        to: [recipientEmail],
        subject: `${docType} ${invoice.number} - ${center?.name || ""}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[SEND-INVOICE-EMAIL] Resend error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("[SEND-INVOICE-EMAIL] Email sent successfully with PDF attachment:", emailData);

    // Update invoice status to 'sent' if it was draft
    if (invoice.status === "draft") {
      await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[SEND-INVOICE-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
