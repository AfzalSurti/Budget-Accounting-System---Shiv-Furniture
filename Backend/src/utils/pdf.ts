import PDFDocument from "pdfkit";

type PdfLine = {
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

type PdfTotals = {
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
};

type PdfMeta = {
  title: string;
  companyName: string;
  docNo: string;
  docDate: string;
  contactLabel: string;
  contactName: string;
  statusLabel: string;
  currency: string;
  paymentStatus?: string;
};

const formatMoney = (value: number, currency: string) =>
  `${currency} ${value.toFixed(2)}`;

type PdfDoc = InstanceType<typeof PDFDocument>;

const drawTableHeader = (doc: PdfDoc, y: number) => {
  doc.fontSize(10).fillColor("#111827");
  doc.text("Item", 40, y, { width: 220 });
  doc.text("Qty", 270, y, { width: 50, align: "right" });
  doc.text("Unit", 330, y, { width: 70, align: "right" });
  doc.text("Tax %", 410, y, { width: 50, align: "right" });
  doc.text("Total", 470, y, { width: 90, align: "right" });
  doc.moveTo(40, y + 14).lineTo(550, y + 14).strokeColor("#e5e7eb").stroke();
};

const ensurePageSpace = (doc: PdfDoc, y: number) => {
  if (y > doc.page.height - 80) {
    doc.addPage();
    return 40;
  }
  return y;
};

export const renderDocumentPdf = async (
  meta: PdfMeta,
  lines: PdfLine[],
  totals: PdfTotals,
): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    doc.fontSize(18).fillColor("#0f172a").text(meta.companyName, 40, 40);
    doc
      .fontSize(14)
      .fillColor("#2563eb")
      .text(meta.title, { align: "right" });

    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(`Document: ${meta.docNo}`, 40, 80)
      .text(`Date: ${meta.docDate}`, 40, 96)
      .text(`${meta.contactLabel}: ${meta.contactName}`, 40, 112)
      .text(`Status: ${meta.statusLabel}`, 40, 128);

    if (meta.paymentStatus) {
      doc.text(`Payment: ${meta.paymentStatus}`, 40, 144);
    }

    let y = 170;
    drawTableHeader(doc, y);
    y += 22;

    doc.fontSize(10).fillColor("#0f172a");
    lines.forEach((line) => {
      y = ensurePageSpace(doc, y);
      doc.text(line.description, 40, y, { width: 220 });
      doc.text(line.qty.toFixed(2), 270, y, { width: 50, align: "right" });
      doc.text(formatMoney(line.unitPrice, meta.currency), 330, y, {
        width: 70,
        align: "right",
      });
      doc.text(line.taxRate.toFixed(2), 410, y, {
        width: 50,
        align: "right",
      });
      doc.text(formatMoney(line.lineTotal, meta.currency), 470, y, {
        width: 90,
        align: "right",
      });
      y += 18;
    });

    y = ensurePageSpace(doc, y + 10);
    doc.moveTo(340, y).lineTo(550, y).strokeColor("#e5e7eb").stroke();
    y += 10;
    doc.fontSize(10).fillColor("#111827");
    doc.text("Subtotal", 340, y, { width: 100 });
    doc.text(formatMoney(totals.subtotal, meta.currency), 470, y, {
      width: 90,
      align: "right",
    });
    y += 16;
    doc.text("Tax", 340, y, { width: 100 });
    doc.text(formatMoney(totals.taxTotal, meta.currency), 470, y, {
      width: 90,
      align: "right",
    });
    y += 16;
    doc.fontSize(11).fillColor("#0f172a");
    doc.text("Total", 340, y, { width: 100 });
    doc.text(formatMoney(totals.grandTotal, meta.currency), 470, y, {
      width: 90,
      align: "right",
    });

    doc.end();
  });
};
