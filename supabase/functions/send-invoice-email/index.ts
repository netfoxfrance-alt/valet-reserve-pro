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

// ─── PDF helpers ───────────────────────────────────────────────────────────────

const stripAccents = (str: string): string =>
  (str || '').replace(/[^\x20-\x7E]/g, (c: string) => {
    const map: Record<string, string> = {
      'é':'e','è':'e','ê':'e','ë':'e','à':'a','â':'a','ä':'a',
      'ô':'o','ö':'o','û':'u','ù':'u','ü':'u','î':'i','ï':'i',
      'ç':'c','É':'E','È':'E','Ê':'E','À':'A','Â':'A','Ô':'O',
      'Û':'U','Î':'I','Ç':'C','€':'EUR',
    };
    return map[c] || c;
  });

const drawText = (page: any, text: string, x: number, y: number, options: any) => {
  const safeText = stripAccents(text || '');
  try { page.drawText(safeText, { x, y, ...options }); }
  catch { page.drawText(safeText.replace(/[^\x20-\x7E]/g, ''), { x, y, ...options }); }
};

const textWidth = (text: string, font: any, fontSize: number): number => {
  try { return font.widthOfTextAtSize(stripAccents(text || ''), fontSize); } catch { return 0; }
};

const truncateText = (text: string, font: any, fontSize: number, maxWidth: number): string => {
  let t = stripAccents(text || '');
  while (t.length > 0) {
    try { if (font.widthOfTextAtSize(t, fontSize) <= maxWidth) return t; } catch { /* */ }
    t = t.slice(0, -1);
  }
  return '';
};

const embedLogo = async (pdfDoc: any, logoUrl: string | null): Promise<any | null> => {
  if (!logoUrl) return null;
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('png') || logoUrl.toLowerCase().endsWith('.png')) return await pdfDoc.embedPng(bytes);
    if (ct.includes('jpeg') || ct.includes('jpg')) return await pdfDoc.embedJpg(bytes);
    try { return await pdfDoc.embedPng(bytes); } catch { /* */ }
    try { return await pdfDoc.embedJpg(bytes); } catch { /* */ }
    return null;
  } catch { return null; }
};

// ─── PDF generator (matches print preview exactly) ────────────────────────────

const generateInvoicePdf = async (invoice: any, items: any[], center: any): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();

  const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ml = 50; // margin left
  const mr = 50; // margin right
  const pw = 595 - ml - mr; // page width
  const dark = rgb(0.067, 0.094, 0.133);    // #111827
  const gray = rgb(0.42, 0.45, 0.49);       // #6b7280
  const lightGray = rgb(0.608, 0.639, 0.671); // #9ca3af
  const bgGray = rgb(0.976, 0.98, 0.984);   // #f9fafb
  const headerBg = rgb(0.953, 0.957, 0.961); // #f3f4f6
  const borderC = rgb(0.898, 0.906, 0.918);  // #e5e7eb

  let y = height - 50;
  const isInv = invoice.type === 'invoice';
  const docType = isInv ? 'FACTURE' : 'DEVIS';

  // ── Logo ──
  const logo = await embedLogo(pdfDoc, center?.logo_url);
  if (logo) {
    const d = logo.scale(1);
    const maxH = 50, maxW = 150;
    const s = Math.min(maxH / d.height, maxW / d.width, 1);
    page.drawImage(logo, { x: ml, y: y - d.height * s, width: d.width * s, height: d.height * s });
    y -= d.height * s + 12;
  }

  // ── Header: Company left, Doc info right ──
  const headerY = y;

  // Company name
  drawText(page, center?.name || '', ml, headerY, { font: fontB, size: 16, color: dark });

  // Doc type (right aligned)
  const dtw = textWidth(docType, fontB, 26);
  drawText(page, docType, 595 - mr - dtw, headerY, { font: fontB, size: 26, color: dark });

  // Company details
  let leftY = headerY - 20;
  if (center?.address) {
    drawText(page, truncateText(center.address, fontR, 10, pw * 0.55), ml, leftY, { font: fontR, size: 10, color: gray });
    leftY -= 14;
  }
  if (center?.phone) {
    drawText(page, `Tel: ${center.phone}`, ml, leftY, { font: fontR, size: 10, color: gray });
    leftY -= 14;
  }
  if (center?.email) {
    drawText(page, center.email, ml, leftY, { font: fontR, size: 10, color: gray });
    leftY -= 14;
  }

  // Doc number & date (right aligned)
  let rightY = headerY - 26;
  const numStr = invoice.number || '';
  const numW = textWidth(numStr, fontB, 14);
  drawText(page, numStr, 595 - mr - numW, rightY, { font: fontB, size: 14, color: dark });
  rightY -= 18;

  const dateStr = `Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const dateW = textWidth(stripAccents(dateStr), fontR, 10);
  drawText(page, dateStr, 595 - mr - dateW, rightY, { font: fontR, size: 10, color: gray });
  rightY -= 15;

  if (isInv && invoice.due_date) {
    const ds = `Echeance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    const dsw = textWidth(stripAccents(ds), fontR, 10);
    drawText(page, ds, 595 - mr - dsw, rightY, { font: fontR, size: 10, color: gray });
  } else if (!isInv && invoice.valid_until) {
    const vs = `Valable jusqu'au: ${new Date(invoice.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    const vsw = textWidth(stripAccents(vs), fontR, 10);
    drawText(page, vs, 595 - mr - vsw, rightY, { font: fontR, size: 10, color: gray });
  }

  y = Math.min(leftY, rightY) - 20;

  // ── Client Box ──
  const clientLines: string[] = [];
  if (invoice.client_address) clientLines.push(stripAccents(invoice.client_address));
  if (invoice.client_phone) clientLines.push(`Tel: ${invoice.client_phone}`);
  if (invoice.client_email) clientLines.push(invoice.client_email);

  const cbPad = 14;
  const cbLineH = 14;
  const cbHeaderH = 16;
  const cbNameH = 20;
  const cbH = cbPad * 2 + cbHeaderH + cbNameH + clientLines.length * cbLineH;

  // Background
  page.drawRectangle({ x: ml, y: y - cbH, width: pw, height: cbH, color: bgGray, borderColor: borderC, borderWidth: 0.5 });

  let cly = y - cbPad - 10;
  drawText(page, isInv ? 'FACTURE A' : 'DEVIS POUR', ml + cbPad, cly, { font: fontR, size: 8, color: lightGray });
  cly -= cbHeaderH;
  drawText(page, stripAccents(invoice.client_name || ''), ml + cbPad, cly, { font: fontB, size: 14, color: dark });
  cly -= cbNameH;

  for (const line of clientLines) {
    drawText(page, line, ml + cbPad, cly, { font: fontR, size: 10, color: gray });
    cly -= cbLineH;
  }

  y = y - cbH - 24;

  // ── Items Table ──
  const colWidths = [pw * 0.42, pw * 0.10, pw * 0.17, pw * 0.11, pw * 0.20];
  const colStarts = [ml];
  for (let i = 1; i < colWidths.length; i++) colStarts.push(colStarts[i - 1] + colWidths[i - 1]);

  const headers = ['Description', 'Qte', 'Prix HT', 'TVA', 'Total HT'];
  const hh = 30;
  const rh = 26;

  // Header row
  page.drawRectangle({ x: ml, y: y - hh, width: pw, height: hh, color: headerBg });
  page.drawLine({ start: { x: ml, y: y - hh }, end: { x: ml + pw, y: y - hh }, thickness: 0.5, color: borderC });

  for (let i = 0; i < headers.length; i++) {
    const isRight = i > 0;
    const tx = isRight ? colStarts[i] + colWidths[i] - textWidth(headers[i], fontB, 10) - 10 : colStarts[i] + 10;
    drawText(page, headers[i], tx, y - 19, { font: fontB, size: 10, color: dark });
  }
  y -= hh;

  // Data rows
  for (let r = 0; r < items.length; r++) {
    const it = items[r];
    if (r % 2 === 1) {
      page.drawRectangle({ x: ml, y: y - rh, width: pw, height: rh, color: bgGray });
    }

    const vals = [
      truncateText(it.description || '', fontR, 10, colWidths[0] - 20),
      String(it.quantity || 1),
      `${(it.unit_price || 0).toFixed(2)}EUR`,
      `${it.vat_rate || 0}%`,
      `${(it.subtotal || 0).toFixed(2)}EUR`,
    ];

    for (let i = 0; i < vals.length; i++) {
      const isRight = i > 0;
      const font = i === 4 ? fontB : fontR;
      const tx = isRight ? colStarts[i] + colWidths[i] - textWidth(vals[i], font, 10) - 10 : colStarts[i] + 10;
      drawText(page, vals[i], tx, y - 17, { font, size: 10, color: dark });
    }

    page.drawLine({ start: { x: ml, y: y - rh }, end: { x: ml + pw, y: y - rh }, thickness: 0.3, color: borderC });
    y -= rh;
  }

  y -= 24;

  // ── Totals ──
  const totW = 200;
  const totX = 595 - mr - totW;

  drawText(page, 'Sous-total HT', totX, y, { font: fontR, size: 11, color: gray });
  const sv = `${(invoice.subtotal || 0).toFixed(2)}EUR`;
  drawText(page, sv, totX + totW - textWidth(sv, fontR, 11), y, { font: fontR, size: 11, color: dark });
  y -= 20;

  drawText(page, 'TVA', totX, y, { font: fontR, size: 11, color: gray });
  const vv = `${(invoice.total_vat || 0).toFixed(2)}EUR`;
  drawText(page, vv, totX + totW - textWidth(vv, fontR, 11), y, { font: fontR, size: 11, color: dark });
  y -= 8;

  page.drawLine({ start: { x: totX, y }, end: { x: totX + totW, y }, thickness: 1.5, color: borderC });
  y -= 20;

  drawText(page, 'Total TTC', totX, y, { font: fontB, size: 15, color: dark });
  const tv = `${(invoice.total || 0).toFixed(2)}EUR`;
  drawText(page, tv, totX + totW - textWidth(tv, fontB, 15), y, { font: fontB, size: 15, color: dark });
  y -= 32;

  // ── Notes & Terms ──
  if (invoice.notes) {
    drawText(page, 'Notes', ml, y, { font: fontB, size: 9, color: lightGray });
    y -= 14;
    for (const line of (invoice.notes || '').split('\n')) {
      if (y < 60) break;
      drawText(page, truncateText(line, fontR, 9, pw), ml, y, { font: fontR, size: 9, color: gray });
      y -= 13;
    }
    y -= 10;
  }
  if (invoice.terms) {
    drawText(page, 'Conditions de paiement', ml, y, { font: fontB, size: 9, color: lightGray });
    y -= 14;
    for (const line of (invoice.terms || '').split('\n')) {
      if (y < 60) break;
      drawText(page, truncateText(line, fontR, 9, pw), ml, y, { font: fontR, size: 9, color: gray });
      y -= 13;
    }
  }

  // ── Footer ──
  const fy = 42;
  page.drawLine({ start: { x: ml, y: fy + 14 }, end: { x: 595 - mr, y: fy + 14 }, thickness: 0.5, color: borderC });

  const fp = stripAccents([center?.name, center?.address].filter(Boolean).join(' - '));
  const fpw = textWidth(fp, fontR, 8);
  drawText(page, fp, (595 - fpw) / 2, fy, { font: fontR, size: 8, color: lightGray });

  const lt = isInv
    ? "En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee."
    : "Ce devis est valable 30 jours a compter de sa date d'emission.";
  const ltw = textWidth(lt, fontR, 8);
  drawText(page, lt, (595 - ltw) / 2, fy - 13, { font: fontR, size: 8, color: lightGray });

  return await pdfDoc.save();
};

// ─── Handler ───────────────────────────────────────────────────────────────────

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

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices").select("*").eq("id", invoiceId).single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: center } = await supabase
      .from("centers").select("name, email, phone, address, logo_url").eq("id", invoice.center_id).single();

    const { data: items } = await supabase
      .from("invoice_items").select("*").eq("invoice_id", invoiceId).order("sort_order");

    const isInvoice = invoice.type === "invoice";
    const isQuote = invoice.type === "quote";
    const docType = isInvoice ? "Facture" : "Devis";

    console.log(`[SEND-INVOICE-EMAIL] Sending ${docType} ${invoice.number} to ${recipientEmail}`);

    // ── Build email body ──

    // Acceptance button for quotes
    let acceptButtonHtml = '';
    if (isQuote && invoice.acceptance_token) {
      const appUrl = "https://www.cleaningpage.com";
      const acceptUrl = `${appUrl}/accept-quote?token=${invoice.acceptance_token}`;
      acceptButtonHtml = `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${acceptUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">&#10003; Accepter ce devis</a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">En cliquant sur ce bouton, vous acceptez le devis ${invoice.number}</p>
        </div>`;
    }

    const itemsRowsHtml = (items || []).map((item: any, idx: number) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      return `<tr style="background:${bg};">
        <td style="padding:10px 12px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${item.description||''}</td>
        <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:center;border-bottom:1px solid #e5e7eb;">${item.quantity||1}</td>
        <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${(item.unit_price||0).toFixed(2)}&#8364;</td>
        <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${item.vat_rate||0}%</td>
        <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${(item.subtotal||0).toFixed(2)}&#8364;</td>
      </tr>`;
    }).join('');

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:40px 20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
      <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <div style="padding:32px 32px 0;">
          <table style="width:100%;border-collapse:collapse;"><tr>
            <td style="vertical-align:top;width:60%;">
              ${center?.logo_url?`<img src="${center.logo_url}" alt="${center?.name||''}" style="max-height:56px;max-width:160px;object-fit:contain;border-radius:10px;margin-bottom:12px;display:block;"/>`:''}
              <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">${center?.name||''}</p>
              ${center?.address?`<p style="margin:0 0 2px;font-size:12px;color:#6b7280;line-height:1.5;">${center.address}</p>`:''}
              ${center?.phone?`<p style="margin:0 0 2px;font-size:12px;color:#6b7280;">T&eacute;l: ${center.phone}</p>`:''}
              ${center?.email?`<p style="margin:0;font-size:12px;color:#6b7280;">${center.email}</p>`:''}
            </td>
            <td style="vertical-align:top;text-align:right;">
              <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#111827;letter-spacing:-0.5px;">${docType.toUpperCase()}</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111827;">${invoice.number}</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</p>
              ${isInvoice&&invoice.due_date?`<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">&Eacute;ch&eacute;ance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</p>`:''}
              ${!isInvoice&&invoice.valid_until?`<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Valable jusqu'au: ${new Date(invoice.valid_until).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</p>`:''}
            </td>
          </tr></table>
        </div>
        <div style="padding:24px 32px;">
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;font-weight:600;">${isInvoice?'FACTUR&Eacute; &Agrave;':'DEVIS POUR'}</p>
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#111827;">${invoice.client_name}</p>
            ${invoice.client_address?`<p style="margin:0 0 2px;font-size:12px;color:#6b7280;">${invoice.client_address}</p>`:''}
            ${invoice.client_phone?`<p style="margin:0 0 2px;font-size:12px;color:#6b7280;">T&eacute;l: ${invoice.client_phone}</p>`:''}
            ${invoice.client_email?`<p style="margin:0;font-size:12px;color:#6b7280;">${invoice.client_email}</p>`:''}
          </div>
        </div>
        <div style="padding:0 32px;">
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <thead><tr style="background:#f3f4f6;">
              <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#111827;text-align:left;">Description</th>
              <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#111827;text-align:center;width:50px;">Qt&eacute;</th>
              <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#111827;text-align:right;width:90px;">Prix HT</th>
              <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#111827;text-align:right;width:60px;">TVA</th>
              <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#111827;text-align:right;width:100px;">Total HT</th>
            </tr></thead>
            <tbody>${itemsRowsHtml}</tbody>
          </table>
        </div>
        <div style="padding:20px 32px 0;">
          <table style="width:260px;margin-left:auto;border-collapse:collapse;">
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Sous-total HT</td><td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-weight:500;">${invoice.subtotal.toFixed(2)}&#8364;</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">TVA</td><td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-weight:500;">${invoice.total_vat.toFixed(2)}&#8364;</td></tr>
            <tr><td colspan="2" style="padding:0;"><div style="border-top:2px solid #e5e7eb;margin:8px 0;"></div></td></tr>
            <tr><td style="padding:4px 0;font-size:16px;font-weight:700;color:#111827;">Total TTC</td><td style="padding:4px 0;font-size:16px;font-weight:800;color:#111827;text-align:right;">${invoice.total.toFixed(2)}&#8364;</td></tr>
          </table>
        </div>
        ${acceptButtonHtml}
        ${invoice.notes?`<div style="padding:16px 32px 0;"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;color:#9ca3af;font-weight:600;">Notes</p><p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;white-space:pre-wrap;">${invoice.notes}</p></div>`:''}
        ${invoice.terms?`<div style="padding:12px 32px 0;"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;color:#9ca3af;font-weight:600;">Conditions de paiement</p><p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;white-space:pre-wrap;">${invoice.terms}</p></div>`:''}
        <div style="padding:24px 32px;margin-top:24px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">${center?.name||''} ${center?.address?`&bull; ${center.address}`:''}</p>
          <p style="margin:0;font-size:11px;color:#9ca3af;">${isInvoice?"En cas de retard de paiement, une p&eacute;nalit&eacute; de 3 fois le taux d'int&eacute;r&ecirc;t l&eacute;gal sera appliqu&eacute;e.":"Ce devis est valable 30 jours &agrave; compter de sa date d'&eacute;mission."}</p>
        </div>
      </div>
    </body></html>`;

    // ── For INVOICES: attach PDF. For QUOTES: HTML only ──

    let emailPayload: any = {
      from: `${center?.name || "Facturation"} <noreply@cleaningpage.com>`,
      to: [recipientEmail],
      subject: `${docType} ${invoice.number} - ${center?.name || ""}`,
      html: emailHtml,
    };

    if (isInvoice) {
      console.log(`[SEND-INVOICE-EMAIL] Generating PDF for invoice ${invoice.number}`);
      const pdfBytes = await generateInvoicePdf(invoice, items || [], center);
      const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
      console.log(`[SEND-INVOICE-EMAIL] PDF generated, ${pdfBytes.length} bytes`);

      const fileName = `Facture-${invoice.number.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
      emailPayload.attachments = [{ filename: fileName, content: pdfBase64 }];
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[SEND-INVOICE-EMAIL] Resend error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("[SEND-INVOICE-EMAIL] Email sent successfully:", emailData);

    if (invoice.status === "draft") {
      await supabase.from("invoices").update({ status: "sent" }).eq("id", invoiceId);
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
