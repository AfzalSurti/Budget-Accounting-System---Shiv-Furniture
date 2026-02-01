import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const DEFAULT_COMPANY_ID =
  process.env.DEFAULT_COMPANY_ID ?? "00000000-0000-0000-0000-000000000001";

const resolveCompanyId = async (
  tx: Prisma.TransactionClient,
  preferredId?: string | null,
) => {
  if (preferredId) {
    await tx.company.upsert({
      where: { id: preferredId },
      update: {},
      create: { id: preferredId, name: "Shiv Furniture" },
    });
    return preferredId;
  }

  const existing = await tx.company.findFirst();
  if (existing) return existing.id;

  const created = await tx.company.upsert({
    where: { id: DEFAULT_COMPANY_ID },
    update: {},
    create: { id: DEFAULT_COMPANY_ID, name: "Shiv Furniture" },
  });
  return created.id;
};

const signToken = (user: { id: string; role: "ADMIN" | "PORTAL"; tokenVersion: number; contactId?: string | null }) => {
  const options: jwt.SignOptions = {};
  if (env.JWT_EXPIRES_IN) {
    options.expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] & (string | number);
  }
  return jwt.sign(
    { sub: user.id, role: user.role, tokenVersion: user.tokenVersion, contactId: user.contactId ?? null },
    env.JWT_SECRET,
    options
  );
};

export const register = async (payload: {
  email: string;
  loginId: string;
  password: string;
  role?: "ADMIN" | "PORTAL";
  contactId?: string | null;
  companyId?: string | null;
  fullName?: string | null;
}) => {
  const normalizedEmail = payload.email.toLowerCase();
  const normalizedLoginId = payload.loginId.toUpperCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const existingLogin = await prisma.user.findUnique({ where: { loginId: normalizedLoginId } });
  if (existingLogin) {
    throw new ApiError(409, "Login ID already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const role = payload.role ?? "PORTAL";
  const user = await prisma.$transaction(async (tx) => {
    let contactId = payload.contactId ?? null;

    if (role === "PORTAL") {
      const resolvedCompanyId = await resolveCompanyId(
        tx,
        payload.companyId ?? null,
      );

      if (contactId) {
        // Verify the contact exists and update it
        const existingContact = await tx.contact.findUnique({
          where: { id: contactId },
        });
        if (!existingContact) {
          throw new ApiError(404, `Contact with ID ${contactId} not found`);
        }
        await tx.contact.update({
          where: { id: contactId },
          data: { isPortalUser: true },
        });
      } else {
        // Try to find existing contact by email first
        const existingContact = await tx.contact.findFirst({
          where: { companyId: resolvedCompanyId, email: normalizedEmail },
        });

        if (existingContact) {
          contactId = existingContact.id;
          await tx.contact.update({
            where: { id: existingContact.id },
            data: { isPortalUser: true },
          });
        } else {
          // Create new contact for this portal user
          const displayName =
            payload.fullName?.trim() ||
            normalizedEmail.split("@")[0] ||
            "Portal Customer";
          const contact = await tx.contact.create({
            data: {
              companyId: resolvedCompanyId,
              contactType: "customer",
              displayName,
              email: normalizedEmail,
              isPortalUser: true,
            },
          });
          contactId = contact.id;
        }
      }
    }

    // Ensure PORTAL users always have a contactId
    if (role === "PORTAL" && !contactId) {
      throw new ApiError(400, "Portal user must be linked to a contact");
    }

    return tx.user.create({
      data: {
        email: normalizedEmail,
        loginId: normalizedLoginId,
        passwordHash,
        role,
        contactId,
      },
    });
  });

  const token = signToken({ id: user.id, role: user.role, tokenVersion: user.tokenVersion, contactId: user.contactId });
  return { user, token };
};

export const login = async (identifier: string, password: string) => {
  const trimmedIdentifier = identifier.trim();
  const isEmail = trimmedIdentifier.includes("@");
  const normalizedIdentifier = isEmail
    ? trimmedIdentifier.toLowerCase()
    : trimmedIdentifier.toUpperCase();

  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: normalizedIdentifier } })
    : await prisma.user.findUnique({ where: { loginId: normalizedIdentifier } });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid credentials");
  }

  let resolvedUser = user;

  if (user.role === "PORTAL" && !user.contactId) {
    resolvedUser = await prisma.$transaction(async (tx) => {
      const companyId = await resolveCompanyId(tx);
      const existingContact = await tx.contact.findFirst({
        where: { companyId, email: user.email.toLowerCase() },
      });
      const contact = existingContact
        ? await tx.contact.update({
            where: { id: existingContact.id },
            data: { isPortalUser: true },
          })
        : await tx.contact.create({
            data: {
              companyId,
              contactType: "customer",
              displayName: user.email.split("@")[0] || "Portal Customer",
              email: user.email.toLowerCase(),
              isPortalUser: true,
            },
          });

      return tx.user.update({
        where: { id: user.id },
        data: { contactId: contact.id },
      });
    });
  }

  const token = signToken({
    id: resolvedUser.id,
    role: resolvedUser.role,
    tokenVersion: resolvedUser.tokenVersion,
    contactId: resolvedUser.contactId,
  });
  return { user: resolvedUser, token };
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
};
