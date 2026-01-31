import { Prisma } from "../generated/prisma/client.js";
export declare const createProduct: (data: {
    companyId: string;
    name: string;
    categoryId?: string | null;
    categoryName?: string | null;
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
    salePrice: Prisma.Decimal;
    costPrice: Prisma.Decimal;
    categoryId: string | null;
}>;
export declare const listProducts: (companyId: string) => Promise<({
    category: {
        name: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    updatedAt: Date;
    companyId: string;
    sku: string | null;
    uom: string;
    salePrice: Prisma.Decimal;
    costPrice: Prisma.Decimal;
    categoryId: string | null;
})[]>;
export declare const listProductCategories: (companyId: string) => Promise<{
    id: string;
    name: string;
    companyId: string;
    parentId: string | null;
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
    salePrice: Prisma.Decimal;
    costPrice: Prisma.Decimal;
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
    salePrice: Prisma.Decimal;
    costPrice: Prisma.Decimal;
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
    salePrice: Prisma.Decimal;
    costPrice: Prisma.Decimal;
    categoryId: string | null;
}>;
//# sourceMappingURL=productController.d.ts.map