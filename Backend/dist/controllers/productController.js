import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const createProduct = async (data) => {
    return prisma.product.create({ data });
};
export const listProducts = async (companyId) => {
    return prisma.product.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
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