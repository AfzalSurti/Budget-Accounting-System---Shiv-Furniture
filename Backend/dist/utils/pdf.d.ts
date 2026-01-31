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
export declare const renderDocumentPdf: (meta: PdfMeta, lines: PdfLine[], totals: PdfTotals) => Promise<Buffer>;
export {};
//# sourceMappingURL=pdf.d.ts.map