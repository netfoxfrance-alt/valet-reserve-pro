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

  // === LOGO ===
  const logoImage = await embedLogo(pdfDoc, center?.logo_url);
  if (logoImage) {
    const logoDims = logoImage.scale(1);
    const maxLogoH = 45;
    const maxLogoW = 160;
    const scale = Math.min(maxLogoH / logoDims.height, maxLogoW / logoDims.width, 1);
    const logoW = logoDims.width * scale;
    const logoH = logoDims.height * scale;
    page.drawImage(logoImage, {
      x: margin,
      y: y - logoH,
      width: logoW,
      height: logoH,
    });
    y -= logoH + 10;
  }

  // === HEADER: Company info (left) + Doc info (right) ===
  const headerStartY = y;
  
  // Company name
  drawText(page, center?.name || '', margin, y, { font: fontBold, size: 14, color: darkText });
  
  // Doc type (right-aligned)
  const docTypeWidth = textWidth(docType, fontBold, 22);
  drawText(page, docType, 595 - margin - docTypeWidth, headerStartY, { font: fontBold, size: 22, color: primary });
  
  y -= 18;

  // Company details
  if (center?.address) {
    const safeAddr = truncateText(stripAccents(center.address), fontRegular, 9, pageWidth * 0.55);
    drawText(page, safeAddr, margin, y, { font: fontRegular, size: 9, color: gray });
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
  const numY = headerStartY - 28;
  const numText = invoice.number || '';
  const numWidth = textWidth(numText, fontBold, 12);
  drawText(page, numText, 595 - margin - numWidth, numY, { font: fontBold, size: 12, color: darkText });

  const issueDate = new Date(invoice.issue_date);
  const dateStr = stripAccents(`Date: ${issueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  const dateWidth = textWidth(dateStr, fontRegular, 9);
  drawText(page, dateStr, 595 - margin - dateWidth, numY - 16, { font: fontRegular, size: 9, color: gray });

  // Due date / Valid until
  if (isInvoice && invoice.due_date) {
    const dueDate = new Date(invoice.due_date);
    const dueStr = stripAccents(`Echeance: ${dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    const dueWidth = textWidth(dueStr, fontRegular, 9);
    drawText(page, dueStr, 595 - margin - dueWidth, numY - 30, { font: fontRegular, size: 9, color: gray });
  } else if (!isInvoice && invoice.valid_until) {
    const validDate = new Date(invoice.valid_until);
    const validStr = stripAccents(`Valable jusqu'au: ${validDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    const validWidth = textWidth(validStr, fontRegular, 9);
    drawText(page, validStr, 595 - margin - validWidth, numY - 30, { font: fontRegular, size: 9, color: gray });
  }

  y -= 20;

  // === CLIENT INFO BOX ===
  const clientBoxY = y;
  const clientBoxHeight = 60 + (invoice.client_address ? 13 : 0) + (invoice.client_phone ? 13 : 0) + (invoice.client_email ? 13 : 0);
  
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
  drawText(page, isInvoice ? 'FACTURE A' : 'DEVIS POUR', margin + 12, clientY, { font: fontRegular, size: 8, color: gray });
  clientY -= 18;
  drawText(page, invoice.client_name || '', margin + 12, clientY, { font: fontBold, size: 12, color: darkText });
  clientY -= 15;

  if (invoice.client_address) {
    drawText(page, stripAccents(invoice.client_address), margin + 12, clientY, { font: fontRegular, size: 9, color: gray });
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

  page.drawRectangle({
    x: margin,
    y: y - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: rgb(0.95, 0.95, 0.96),
  });

  let colX = margin;
  for (let i = 0; i < headers.length; i++) {
    const isRight = i > 0;
    const tx = isRight ? colX + colWidths[i] - textWidth(headers[i], fontBold, 9) - 8 : colX + 8;
    drawText(page, headers[i], tx, y - 18, { font: fontBold, size: 9, color: darkText });
    colX += colWidths[i];
  }

  y -= headerHeight;

  for (let r = 0; r < items.length; r++) {
    const item = items[r];
    
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
      truncateText(stripAccents(item.description || ''), fontRegular, 9, colWidths[0] - 16),
      String(item.quantity || 1),
      `${(item.unit_price || 0).toFixed(2)}`,
      `${item.vat_rate || 0}%`,
      `${(item.subtotal || 0).toFixed(2)}`,
    ];

    for (let i = 0; i < values.length; i++) {
      const isRight = i > 0;
      const tx = isRight ? colX + colWidths[i] - textWidth(values[i], fontRegular, 9) - 8 : colX + 8;
      drawText(page, values[i], tx, y - 16, { font: i === 4 ? fontBold : fontRegular, size: 9, color: darkText });
      colX += colWidths[i];
    }

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

  drawText(page, 'Sous-total HT', totalsX, y, { font: fontRegular, size: 10, color: gray });
  const stVal = `${(invoice.subtotal || 0).toFixed(2)}`;
  drawText(page, stVal, totalsX + totalsWidth - textWidth(stVal, fontRegular, 10), y, { font: fontRegular, size: 10, color: darkText });
  y -= 18;

  drawText(page, 'TVA', totalsX, y, { font: fontRegular, size: 10, color: gray });
  const vatVal = `${(invoice.total_vat || 0).toFixed(2)}`;
  drawText(page, vatVal, totalsX + totalsWidth - textWidth(vatVal, fontRegular, 10), y, { font: fontRegular, size: 10, color: darkText });
  y -= 6;

  page.drawLine({
    start: { x: totalsX, y },
    end: { x: totalsX + totalsWidth, y },
    thickness: 1,
    color: borderGray,
  });
  y -= 18;

  drawText(page, 'Total TTC', totalsX, y, { font: fontBold, size: 13, color: darkText });
  const totalVal = `${(invoice.total || 0).toFixed(2)}`;
  drawText(page, totalVal, totalsX + totalsWidth - textWidth(totalVal, fontBold, 13), y, { font: fontBold, size: 13, color: primary });
  y -= 30;

  // === NOTES ===
  if (invoice.notes) {
    drawText(page, 'Notes', margin, y, { font: fontBold, size: 9, color: gray });
    y -= 14;
    const noteLines = (invoice.notes || '').split('\n');
    for (const line of noteLines) {
      const safeLine = truncateText(stripAccents(line), fontRegular, 8, pageWidth);
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
      const safeLine = truncateText(stripAccents(line), fontRegular, 8, pageWidth);
      drawText(page, safeLine, margin, y, { font: fontRegular, size: 8, color: gray });
      y -= 12;
    }
    y -= 8;
  }

  // === FOOTER ===
  const footerY = 40;
  const footerParts = stripAccents([center?.name, center?.address].filter(Boolean).join(' - '));
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
