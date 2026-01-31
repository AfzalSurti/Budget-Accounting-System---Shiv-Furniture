import { Prisma } from "../generated/prisma/client.js";
export declare const createContact: (data: {
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
}) => Promise<{
    id: string;
    createdAt: Date;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
    contactType: import("../generated/prisma/index.js").$Enums.ContactType;
    displayName: string;
    phone: string | null;
    imgUrl: string | null;
    gstin: string | null;
    billingAddress: Prisma.JsonValue | null;
    shippingAddress: Prisma.JsonValue | null;
    isPortalUser: boolean;
    portalUserExternalId: string | null;
    companyId: string;
}>;
export declare const listContacts: (companyId: string) => Promise<({
    contactTags: ({
        tag: {
            id: string;
            createdAt: Date;
            name: string;
            companyId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        contactId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
    contactType: import("../generated/prisma/index.js").$Enums.ContactType;
    displayName: string;
    phone: string | null;
    imgUrl: string | null;
    gstin: string | null;
    billingAddress: Prisma.JsonValue | null;
    shippingAddress: Prisma.JsonValue | null;
    isPortalUser: boolean;
    portalUserExternalId: string | null;
    companyId: string;
})[]>;
export declare const listContactTags: (companyId: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    companyId: string;
}[]>;
export declare const createContactTag: (data: {
    companyId: string;
    name: string;
}) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    companyId: string;
}>;
export declare const getContact: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
    contactType: import("../generated/prisma/index.js").$Enums.ContactType;
    displayName: string;
    phone: string | null;
    imgUrl: string | null;
    gstin: string | null;
    billingAddress: Prisma.JsonValue | null;
    shippingAddress: Prisma.JsonValue | null;
    isPortalUser: boolean;
    portalUserExternalId: string | null;
    companyId: string;
}>;
export declare const updateContact: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
    id: string;
    createdAt: Date;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
    contactType: import("../generated/prisma/index.js").$Enums.ContactType;
    displayName: string;
    phone: string | null;
    imgUrl: string | null;
    gstin: string | null;
    billingAddress: Prisma.JsonValue | null;
    shippingAddress: Prisma.JsonValue | null;
    isPortalUser: boolean;
    portalUserExternalId: string | null;
    companyId: string;
}>;
export declare const archiveContact: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
    contactType: import("../generated/prisma/index.js").$Enums.ContactType;
    displayName: string;
    phone: string | null;
    imgUrl: string | null;
    gstin: string | null;
    billingAddress: Prisma.JsonValue | null;
    shippingAddress: Prisma.JsonValue | null;
    isPortalUser: boolean;
    portalUserExternalId: string | null;
    companyId: string;
}>;
//# sourceMappingURL=contactController.d.ts.map