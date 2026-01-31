type DocType = "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";
export declare const getContactTagIds: (contactId?: string | null) => Promise<string[]>;
type AutoAnalyticMatch = {
    analyticAccountId: string;
    modelId: string;
    ruleId: string;
    matchedFieldsCount: number;
};
export declare const resolveAnalyticAccountId: (input: {
    companyId: string;
    docType: DocType;
    productId?: string | null;
    categoryId?: string | null;
    contactId?: string | null;
    contactTagIds?: string[];
}) => Promise<AutoAnalyticMatch | null>;
export {};
//# sourceMappingURL=autoAnalyticService.d.ts.map