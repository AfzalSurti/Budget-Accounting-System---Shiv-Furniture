import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const createProduct = async (data: {
  companyId: string;
  name: string;
  categoryId?: string | null;
  sku?: string | null;
  uom?: string;
  salePrice?: number;
  costPrice?: number;
  isActive?: boolean;
}) => {
  return prisma.product.create({ data });
};

export const listProducts = async (companyId: string) => {
  return prisma.product.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

export const getProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const updateProduct = async (id: string, data: Partial<Record<string, unknown>>) => {
  try {
    return await prisma.product.update({ where: { id }, data });
  } catch (error) {
    throw new ApiError(404, "Product not found", error);
  }
};

export const archiveProduct = async (id: string) => {
  try {
    return await prisma.product.update({ where: { id }, data: { isActive: false } });
  } catch (error) {
    throw new ApiError(404, "Product not found", error);
  }
};
