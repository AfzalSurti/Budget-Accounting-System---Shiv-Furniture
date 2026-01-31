import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";
export const createContact = async (data) => {
    await prisma.company.upsert({
        where: { id: data.companyId },
        update: {},
        create: {
            id: data.companyId,
            name: "Shiv Furniture",
        },
    });
    const createData = {
        company: { connect: { id: data.companyId } },
        contactType: data.contactType,
        displayName: data.displayName,
    };
    if (data.email !== undefined)
        createData.email = data.email;
    if (data.phone !== undefined)
        createData.phone = data.phone;
    if (data.gstin !== undefined)
        createData.gstin = data.gstin;
    if (data.billingAddress !== undefined) {
        createData.billingAddress = data.billingAddress === null ? Prisma.JsonNull : data.billingAddress;
    }
    if (data.shippingAddress !== undefined) {
        createData.shippingAddress = data.shippingAddress === null ? Prisma.JsonNull : data.shippingAddress;
    }
    return prisma.contact.create({ data: createData });
};
export const listContacts = async (companyId) => {
    return prisma.contact.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
    });
};
export const getContact = async (id) => {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
        throw new ApiError(404, "Contact not found");
    }
    return contact;
};
export const updateContact = async (id, data) => {
    try {
        return await prisma.contact.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Contact not found", error);
    }
};
export const archiveContact = async (id) => {
    try {
        return await prisma.contact.update({ where: { id }, data: { isActive: false } });
    }
    catch (error) {
        throw new ApiError(404, "Contact not found", error);
    }
};
//# sourceMappingURL=contactController.js.map