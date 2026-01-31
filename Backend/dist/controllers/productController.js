import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";
export const createProduct = async (data) => {
    await prisma.company.upsert({
        where: { id: data.companyId },
        update: {},
        create: {
            id: data.companyId,
            name: "Shiv Furniture",
        },
    });
    let categoryId = data.categoryId ?? null;
    const categoryName = data.categoryName?.trim();
    if (!categoryId && categoryName) {
        const category = await prisma.productCategory.upsert({
            where: { companyId_name: { companyId: data.companyId, name: categoryName } },
            update: {},
            create: {
                companyId: data.companyId,
                name: categoryName,
            },
        });
        categoryId = category.id;
    }
    const createData = {
        companyId: data.companyId,
        name: data.name,
        categoryId,
        sku: data.sku ?? null,
        uom: data.uom ?? "unit",
    };
    if (data.salePrice !== undefined)
        createData.salePrice = data.salePrice;
    if (data.costPrice !== undefined)
        createData.costPrice = data.costPrice;
    if (data.isActive !== undefined)
        createData.isActive = data.isActive;
    return prisma.product.create({ data: createData });
};
export const listProducts = async (companyId) => {
    return prisma.product.findMany({
        where: { companyId },
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    });
};
export const listProductCategories = async (companyId) => {
    return prisma.productCategory.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
    });
};
export const getProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return product;
};
export const updateProduct = async (id, data) => {
    try {
        return await prisma.product.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Product not found", error);
    }
};
export const archiveProduct = async (id) => {
    try {
        return await prisma.product.update({ where: { id }, data: { isActive: false } });
    }
    catch (error) {
        throw new ApiError(404, "Product not found", error);
    }
};
//# sourceMappingURL=productController.js.map