export declare const createProduct: (data: {
    companyId: string;
    name: string;
    categoryId?: string | null;
    sku?: string | null;
    uom?: string;
    salePrice?: number;
    costPrice?: number;
    isActive?: boolean;
}) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: import("@prisma/client-runtime-utils").Decimal;
    costPrice: import("@prisma/client-runtime-utils").Decimal;
    categoryId: string | null;
}>;
export declare const listProducts: (companyId: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: import("@prisma/client-runtime-utils").Decimal;
    costPrice: import("@prisma/client-runtime-utils").Decimal;
    categoryId: string | null;
}[]>;
export declare const getProduct: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: import("@prisma/client-runtime-utils").Decimal;
    costPrice: import("@prisma/client-runtime-utils").Decimal;
    categoryId: string | null;
}>;
export declare const updateProduct: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: import("@prisma/client-runtime-utils").Decimal;
    costPrice: import("@prisma/client-runtime-utils").Decimal;
    categoryId: string | null;
}>;
export declare const archiveProduct: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: import("@prisma/client-runtime-utils").Decimal;
    costPrice: import("@prisma/client-runtime-utils").Decimal;
    categoryId: string | null;
}>;
//# sourceMappingURL=productController.d.ts.map