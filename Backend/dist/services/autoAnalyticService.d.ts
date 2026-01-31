type DocType = "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";
export declare const resolveAnalyticAccountId: (input: {
    companyId: string;
    docType: DocType;
    productId?: string | null;
    categoryId?: string | null;
    contactId?: string | null;
}) => Promise<string | null>;
export {};
//# sourceMappingURL=autoAnalyticService.d.ts.map