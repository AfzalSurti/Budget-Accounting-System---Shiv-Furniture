export declare const createAnalyticAccount: (data: {
    companyId: string;
    code?: string | null;
    name: string;
    parentId?: string | null;
    isActive?: boolean;
}) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    code: string | null;
    parentId: string | null;
}>;
export declare const listAnalyticAccounts: (companyId: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    code: string | null;
    parentId: string | null;
}[]>;
export declare const getAnalyticAccount: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    code: string | null;
    parentId: string | null;
}>;
export declare const updateAnalyticAccount: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    code: string | null;
    parentId: string | null;
}>;
export declare const archiveAnalyticAccount: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    companyId: string;
    code: string | null;
    parentId: string | null;
}>;
//# sourceMappingURL=analyticAccountController.d.ts.map