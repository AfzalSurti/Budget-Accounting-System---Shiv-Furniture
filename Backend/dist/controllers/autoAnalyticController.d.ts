export declare const createAutoAnalyticModel: (data: {
    companyId: string;
    name: string;
    priority?: number;
    rules: Array<{
        docType: "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";
        matchProductId?: string | null;
        matchCategoryId?: string | null;
        matchContactId?: string | null;
        matchContactTagId?: string | null;
        assignAnalyticAccountId: string;
        rulePriority?: number;
    }>;
}) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    priority: number;
}>;
export declare const listAutoAnalyticModels: (companyId: string) => Promise<({
    rules: {
        id: string;
        isActive: boolean;
        modelId: string;
        docType: import("../generated/prisma/index.js").$Enums.AutoDocType;
        matchProductId: string | null;
        matchCategoryId: string | null;
        matchContactId: string | null;
        matchContactTagId: string | null;
        assignAnalyticAccountId: string;
        rulePriority: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    priority: number;
})[]>;
export declare const getAutoAnalyticModel: (id: string) => Promise<{
    rules: {
        id: string;
        isActive: boolean;
        modelId: string;
        docType: import("../generated/prisma/index.js").$Enums.AutoDocType;
        matchProductId: string | null;
        matchCategoryId: string | null;
        matchContactId: string | null;
        matchContactTagId: string | null;
        assignAnalyticAccountId: string;
        rulePriority: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    priority: number;
}>;
export declare const updateAutoAnalyticModel: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    priority: number;
}>;
export declare const archiveAutoAnalyticModel: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    priority: number;
}>;
//# sourceMappingURL=autoAnalyticController.d.ts.map