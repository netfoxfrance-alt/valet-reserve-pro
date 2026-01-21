import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: string;
  recipientEmail: string;
}

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

    // Fetch invoice with items
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
    const docType = isInvoice ? "Facture" : "Devis";
    const issueDate = new Date(invoice.issue_date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Build items HTML
    const itemsHtml = (items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unit_price.toFixed(2)}€</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.vat_rate}%</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${item.subtotal.toFixed(2)}€</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-height: 60px; margin-bottom: 10px; }
          .doc-title { font-size: 28px; font-weight: bold; color: #3b82f6; margin: 10px 0; }
          .doc-number { font-size: 18px; color: #6b7280; }
          .info-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .info-label { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; }
          th:not(:first-child) { text-align: right; }
          .totals { text-align: right; margin: 20px 0; }
          .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
          .total-label { color: #6b7280; margin-right: 20px; min-width: 100px; }
          .total-value { font-weight: 500; min-width: 80px; }
          .grand-total { font-size: 20px; font-weight: bold; color: #3b82f6; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${center?.logo_url ? `<img src="${center.logo_url}" alt="${center?.name}" class="logo">` : ""}
            <h1 class="doc-title">${docType.toUpperCase()}</h1>
            <p class="doc-number">${invoice.number}</p>
            <p style="color: #6b7280; margin: 8px 0;">Date : ${issueDate}</p>
          </div>

          <div class="info-box">
            <p class="info-label">Facturé à</p>
            <p style="font-weight: 600; font-size: 16px; margin: 0;">${invoice.client_name}</p>
            ${invoice.client_address ? `<p style="margin: 4px 0 0 0;">${invoice.client_address}</p>` : ""}
            ${invoice.client_phone ? `<p style="margin: 4px 0 0 0;">Tél: ${invoice.client_phone}</p>` : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>Prix HT</th>
                <th>TVA</th>
                <th>Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Sous-total HT</span>
              <span class="total-value">${invoice.subtotal.toFixed(2)}€</span>
            </div>
            <div class="total-row">
              <span class="total-label">TVA</span>
              <span class="total-value">${invoice.total_vat.toFixed(2)}€</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total TTC</span>
              <span class="total-value">${invoice.total.toFixed(2)}€</span>
            </div>
          </div>

          ${invoice.notes ? `<div class="info-box"><p class="info-label">Notes</p><p style="margin: 0;">${invoice.notes}</p></div>` : ""}

          <div class="footer">
            <p><strong>${center?.name}</strong></p>
            ${center?.address ? `<p>${center.address}</p>` : ""}
            ${center?.phone ? `<p>Tél: ${center.phone}</p>` : ""}
            ${center?.email ? `<p>${center.email}</p>` : ""}
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
        from: `${center?.name || "Facturation"} <onboarding@resend.dev>`,
        to: [recipientEmail],
        subject: `${docType} ${invoice.number} - ${center?.name || ""}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

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
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
