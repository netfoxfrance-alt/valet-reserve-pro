import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

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
  // Replace special characters that might cause encoding issues
  const safeText = (text || '').replace(/[^\x20-\x7E\u00C0-\u00FF]/g, '');
  try {
    page.drawText(safeText, { x, y, ...options });
  } catch {
    // Fallback: strip to ASCII only
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

const generateInvoicePdf = async (invoice: any, items: any[], center: any): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = 595 - margin * 2;
  const gray = rgb(0.42, 0.45, 0.49);
  const lightGray = rgb(0.96, 0.96, 0.97);
  const darkText = rgb(0.12, 0.16, 0.21);
  const primary = rgb(0.23, 0.51, 0.96);
  const borderGray = rgb(0.9, 0.91, 0.92);

  let y = height - margin;

  const isInvoice = invoice.type === 'invoice';
  const docType = isInvoice ? 'FACTURE' : 'DEVIS';

  // === HEADER: Company info (left) + Doc info (right) ===
  
  // Company name
  drawText(page, center?.name || '', margin, y, { font: fontBold, size: 14, color: darkText });
  
  // Doc type (right-aligned)
  const docTypeWidth = textWidth(docType, fontBold, 22);
  drawText(page, docType, 595 - margin - docTypeWidth, y, { font: fontBold, size: 22, color: primary });
  
  y -= 18;

  // Company details
  if (center?.address) {
    drawText(page, center.address, margin, y, { font: fontRegular, size: 9, color: gray });
    y -= 13;
  }
  if (center?.phone) {
    drawText(page, `Tel: ${center.phone}`, margin, y, { font: fontRegular, size: 9, color: gray });
    y -= 13;
  }
  if (center?.email) {
    drawText(page, center.email, margin, y, { font: fontRegular, size: 9, color: gray });
    y -= 13;
  }

  // Doc number + date (right side)
  const numY = height - margin - 28;
  const numText = invoice.number || '';
  const numWidth = textWidth(numText, fontBold, 12);
  drawText(page, numText, 595 - margin - numWidth, numY, { font: fontBold, size: 12, color: darkText });

  const issueDate = new Date(invoice.issue_date);
  const dateStr = `Date: ${issueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const safeDateStr = dateStr.replace(/[^\x20-\x7E]/g, (c: string) => {
    const map: Record<string, string> = { 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'à': 'a', 'â': 'a', 'ô': 'o', 'û': 'u', 'ù': 'u', 'î': 'i', 'ï': 'i', 'ç': 'c' };
    return map[c] || c;
  });
  const dateWidth = textWidth(safeDateStr, fontRegular, 9);
  drawText(page, safeDateStr, 595 - margin - dateWidth, numY - 16, { font: fontRegular, size: 9, color: gray });

  // Due date / Valid until
  if (isInvoice && invoice.due_date) {
    const dueDate = new Date(invoice.due_date);
    const dueStr = `Echeance: ${dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`.replace(/[^\x20-\x7E]/g, (c: string) => {
      const map: Record<string, string> = { 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'à': 'a', 'â': 'a', 'ô': 'o', 'û': 'u', 'ù': 'u', 'î': 'i', 'ï': 'i', 'ç': 'c' };
      return map[c] || c;
    });
    const dueWidth = textWidth(dueStr, fontRegular, 9);
    drawText(page, dueStr, 595 - margin - dueWidth, numY - 30, { font: fontRegular, size: 9, color: gray });
  } else if (!isInvoice && invoice.valid_until) {
    const validDate = new Date(invoice.valid_until);
    const validStr = `Valable jusqu'au: ${validDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`.replace(/[^\x20-\x7E]/g, (c: string) => {
      const map: Record<string, string> = { 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'à': 'a', 'â': 'a', 'ô': 'o', 'û': 'u', 'ù': 'u', 'î': 'i', 'ï': 'i', 'ç': 'c' };
      return map[c] || c;
    });
    const validWidth = textWidth(validStr, fontRegular, 9);
    drawText(page, validStr, 595 - margin - validWidth, numY - 30, { font: fontRegular, size: 9, color: gray });
  }

  y -= 20;

  // === CLIENT INFO BOX ===
  const clientBoxY = y;
  const clientBoxHeight = 60 + (invoice.client_address ? 13 : 0) + (invoice.client_phone ? 13 : 0) + (invoice.client_email ? 13 : 0);
  
  // Background box
  page.drawRectangle({
    x: margin,
    y: clientBoxY - clientBoxHeight,
    width: pageWidth,
    height: clientBoxHeight,
    color: lightGray,
    borderColor: borderGray,
    borderWidth: 0.5,
  });

  let clientY = clientBoxY - 16;
  drawText(page, 'FACTURE A', margin + 12, clientY, { font: fontRegular, size: 8, color: gray });
  clientY -= 18;
  drawText(page, invoice.client_name || '', margin + 12, clientY, { font: fontBold, size: 12, color: darkText });
  clientY -= 15;

  if (invoice.client_address) {
    drawText(page, invoice.client_address, margin + 12, clientY, { font: fontRegular, size: 9, color: gray });
    clientY -= 13;
  }
  if (invoice.client_phone) {
    drawText(page, `Tel: ${invoice.client_phone}`, margin + 12, clientY, { font: fontRegular, size: 9, color: gray });
    clientY -= 13;
  }
  if (invoice.client_email) {
    drawText(page, invoice.client_email, margin + 12, clientY, { font: fontRegular, size: 9, color: gray });
    clientY -= 13;
  }

  y = clientBoxY - clientBoxHeight - 25;

  // === ITEMS TABLE ===
  const colWidths = [pageWidth * 0.40, pageWidth * 0.10, pageWidth * 0.18, pageWidth * 0.12, pageWidth * 0.20];
  const headers = ['Description', 'Qte', 'Prix HT', 'TVA', 'Total HT'];
  const headerHeight = 28;
  const rowHeight = 24;

  // Table header background
  page.drawRectangle({
    x: margin,
    y: y - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: rgb(0.95, 0.95, 0.96),
  });

  // Header text
  let colX = margin;
  for (let i = 0; i < headers.length; i++) {
    const isRight = i > 0;
    const tx = isRight ? colX + colWidths[i] - textWidth(headers[i], fontBold, 9) - 8 : colX + 8;
    drawText(page, headers[i], tx, y - 18, { font: fontBold, size: 9, color: darkText });
    colX += colWidths[i];
  }

  y -= headerHeight;

  // Table rows
  for (let r = 0; r < items.length; r++) {
    const item = items[r];
    
    // Alternate row background
    if (r % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: y - rowHeight,
        width: pageWidth,
        height: rowHeight,
        color: lightGray,
      });
    }

    colX = margin;
    const values = [
      truncateText(item.description || '', fontRegular, 9, colWidths[0] - 16),
      String(item.quantity || 1),
      `${(item.unit_price || 0).toFixed(2)}€`,
      `${item.vat_rate || 0}%`,
      `${(item.subtotal || 0).toFixed(2)}€`,
    ];

    for (let i = 0; i < values.length; i++) {
      const isRight = i > 0;
      const tx = isRight ? colX + colWidths[i] - textWidth(values[i], fontRegular, 9) - 8 : colX + 8;
      drawText(page, values[i], tx, y - 16, { font: i === 4 ? fontBold : fontRegular, size: 9, color: darkText });
      colX += colWidths[i];
    }

    // Row border
    page.drawLine({
      start: { x: margin, y: y - rowHeight },
      end: { x: margin + pageWidth, y: y - rowHeight },
      thickness: 0.3,
      color: borderGray,
    });

    y -= rowHeight;
  }

  y -= 20;

  // === TOTALS ===
  const totalsX = 595 - margin - 180;
  const totalsWidth = 180;

  // Sous-total HT
  drawText(page, 'Sous-total HT', totalsX, y, { font: fontRegular, size: 10, color: gray });
  const stVal = `${(invoice.subtotal || 0).toFixed(2)}€`;
  drawText(page, stVal, totalsX + totalsWidth - textWidth(stVal, fontRegular, 10), y, { font: fontRegular, size: 10, color: darkText });
  y -= 18;

  // TVA
  drawText(page, 'TVA', totalsX, y, { font: fontRegular, size: 10, color: gray });
  const vatVal = `${(invoice.total_vat || 0).toFixed(2)}€`;
  drawText(page, vatVal, totalsX + totalsWidth - textWidth(vatVal, fontRegular, 10), y, { font: fontRegular, size: 10, color: darkText });
  y -= 6;

  // Separator
  page.drawLine({
    start: { x: totalsX, y },
    end: { x: totalsX + totalsWidth, y },
    thickness: 1,
    color: borderGray,
  });
  y -= 18;

  // Total TTC
  drawText(page, 'Total TTC', totalsX, y, { font: fontBold, size: 13, color: darkText });
  const totalVal = `${(invoice.total || 0).toFixed(2)}€`;
  drawText(page, totalVal, totalsX + totalsWidth - textWidth(totalVal, fontBold, 13), y, { font: fontBold, size: 13, color: primary });
  y -= 30;

  // === NOTES ===
  if (invoice.notes) {
    drawText(page, 'Notes', margin, y, { font: fontBold, size: 9, color: gray });
    y -= 14;
    const noteLines = (invoice.notes || '').split('\n');
    for (const line of noteLines) {
      const safeLine = truncateText(line, fontRegular, 8, pageWidth);
      drawText(page, safeLine, margin, y, { font: fontRegular, size: 8, color: gray });
      y -= 12;
    }
    y -= 8;
  }

  if (invoice.terms) {
    drawText(page, 'Conditions de paiement', margin, y, { font: fontBold, size: 9, color: gray });
    y -= 14;
    const termLines = (invoice.terms || '').split('\n');
    for (const line of termLines) {
      const safeLine = truncateText(line, fontRegular, 8, pageWidth);
      drawText(page, safeLine, margin, y, { font: fontRegular, size: 8, color: gray });
      y -= 12;
    }
    y -= 8;
  }

  // === FOOTER ===
  const footerY = 40;
  const footerParts = [center?.name, center?.address].filter(Boolean).join(' - ');
  const footerWidth = textWidth(footerParts, fontRegular, 7);
  drawText(page, footerParts, (595 - footerWidth) / 2, footerY, { font: fontRegular, size: 7, color: gray });

  const legalText = isInvoice
    ? "En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee."
    : "Ce devis est valable 30 jours a compter de sa date d'emission.";
  const legalWidth = textWidth(legalText, fontRegular, 7);
  drawText(page, legalText, (595 - legalWidth) / 2, footerY - 12, { font: fontRegular, size: 7, color: gray });

  return await pdfDoc.save();
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
      // Build the accept URL - use the app's published URL
      const appUrl = "https://valet-reserve-pro.lovable.app";
      const acceptUrl = `${appUrl}/accept-quote?token=${invoice.acceptance_token}`;
      
      acceptButtonHtml = `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${acceptUrl}" 
             style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            ✓ Accepter ce devis
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
            En cliquant sur ce bouton, vous acceptez le devis ${invoice.number}
          </p>
        </div>
      `;
    }

    // Simple email body
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; padding: 40px 20px; background: #f9fafb;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 8px; font-size: 20px;">${docType} ${invoice.number}</h2>
          <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">De ${center?.name || ''}</p>
          
          <p style="margin: 0 0 16px; font-size: 15px;">
            Bonjour ${invoice.client_name},
          </p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
            Veuillez trouver ci-joint ${isInvoice ? 'votre facture' : 'votre devis'} <strong>${invoice.number}</strong> d'un montant de <strong>${invoice.total.toFixed(2)}€ TTC</strong>.
          </p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Montant HT</td>
                <td style="text-align: right; font-weight: 500;">${invoice.subtotal.toFixed(2)}€</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">TVA</td>
                <td style="text-align: right; font-weight: 500;">${invoice.total_vat.toFixed(2)}€</td>
              </tr>
              <tr style="border-top: 1px solid #d1d5db;">
                <td style="color: #111827; padding: 8px 0 0; font-weight: 600;">Total TTC</td>
                <td style="text-align: right; font-weight: 700; color: #3b82f6; padding-top: 8px;">${invoice.total.toFixed(2)}€</td>
              </tr>
            </table>
          </div>

          ${acceptButtonHtml}

          <p style="font-size: 13px; color: #9ca3af; margin: 0;">
            Le document complet est en piece jointe au format PDF.
          </p>
        </div>
        <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px;">
          ${center?.name || ''} ${center?.address ? `· ${center.address}` : ''}
        </p>
      </body>
      </html>
    `;

    const fileName = `${docType}-${invoice.number.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;

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
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
          },
        ],
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
