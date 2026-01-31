import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export const createContact = async (data: {
  companyId: string;
  contactType: "customer" | "vendor" | "both" | "internal";
  displayName: string;
  email?: string | null;
  phone?: string | null;
  imgUrl?: string | null;
  gstin?: string | null;
  billingAddress?: Prisma.InputJsonValue | null;
  shippingAddress?: Prisma.InputJsonValue | null;
  tags?: string[];
}) => {
  await prisma.company.upsert({
    where: { id: data.companyId },
    update: {},
    create: {
      id: data.companyId,
      name: "Shiv Furniture",
    },
  });

  const createData: Prisma.ContactCreateInput = {
    company: { connect: { id: data.companyId } },
    contactType: data.contactType,
    displayName: data.displayName,
  };

  if (data.email !== undefined) createData.email = data.email;
  if (data.phone !== undefined) createData.phone = data.phone;
  if (data.imgUrl !== undefined) createData.imgUrl = data.imgUrl;
  if (data.gstin !== undefined) createData.gstin = data.gstin;
  if (data.billingAddress !== undefined) {
    createData.billingAddress = data.billingAddress === null ? Prisma.JsonNull : data.billingAddress;
  }
  if (data.shippingAddress !== undefined) {
    createData.shippingAddress = data.shippingAddress === null ? Prisma.JsonNull : data.shippingAddress;
  }

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({ data: createData });

    const tagNames = (data.tags ?? [])
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (tagNames.length > 0) {
      const uniqueNames = Array.from(new Set(tagNames));
      const tags = await Promise.all(
        uniqueNames.map((name) =>
          tx.contactTag.upsert({
            where: { companyId_name: { companyId: data.companyId, name } },
            update: {},
            create: { companyId: data.companyId, name },
          })
        )
      );

      await tx.contactTagAssignment.createMany({
        data: tags.map((tag) => ({ contactId: contact.id, tagId: tag.id })),
        skipDuplicates: true,
      });
    }

    return contact;
  });
};

export const listContacts = async (companyId: string) => {
  return prisma.contact.findMany({
    where: { companyId },
    include: { contactTags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const listContactTags = async (companyId: string) => {
  return prisma.contactTag.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });
};

export const createContactTag = async (data: { companyId: string; name: string }) => {
  return prisma.contactTag.upsert({
    where: { companyId_name: { companyId: data.companyId, name: data.name } },
    update: {},
    create: { companyId: data.companyId, name: data.name },
  });
};

export const getContact = async (id: string) => {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }
  return contact;
};

export const updateContact = async (id: string, data: Partial<Record<string, unknown>>) => {
  const { tags, ...rest } = data as { tags?: string[] };
  try {
    return await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.update({ where: { id }, data: rest });

      if (tags !== undefined) {
        const tagNames = tags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        const uniqueNames = Array.from(new Set(tagNames));

        const tagRecords = await Promise.all(
          uniqueNames.map((name) =>
            tx.contactTag.upsert({
              where: { companyId_name: { companyId: contact.companyId, name } },
              update: {},
              create: { companyId: contact.companyId, name },
            })
          )
        );

        await tx.contactTagAssignment.deleteMany({ where: { contactId: contact.id } });
        if (tagRecords.length > 0) {
          await tx.contactTagAssignment.createMany({
            data: tagRecords.map((tag) => ({ contactId: contact.id, tagId: tag.id })),
          });
        }
      }

      return contact;
    });
  } catch (error) {
    throw new ApiError(404, "Contact not found", error);
  }
};

export const archiveContact = async (id: string) => {
  try {
    return await prisma.contact.update({ where: { id }, data: { isActive: false } });
  } catch (error) {
    throw new ApiError(404, "Contact not found", error);
  }
};
