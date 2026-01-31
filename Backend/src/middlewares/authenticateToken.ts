import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

type JwtPayload = {
  sub: string;
  userId?: string;
  role: "ADMIN" | "PORTAL";
  tokenVersion: number;
  contactId?: string | null;
};

export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization header"));
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const userId = payload.sub ?? payload.userId;
    if (!userId) {
      return next(new ApiError(401, "Invalid token payload"));
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        tokenVersion: true,
        isActive: true,
        contactId: true,
        email: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new ApiError(401, "User not found or inactive"));
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return next(new ApiError(401, "Token has been revoked"));
    }

    if (user.role === "PORTAL" && !user.contactId) {
      const defaultCompanyId =
        process.env.DEFAULT_COMPANY_ID ?? "00000000-0000-0000-0000-000000000001";

      const company = await prisma.company.upsert({
        where: { id: defaultCompanyId },
        update: {},
        create: { id: defaultCompanyId, name: "Shiv Furniture" },
      });

      const normalizedEmail = user.email.toLowerCase();
      const existingContact = await prisma.contact.findFirst({
        where: { companyId: company.id, email: normalizedEmail },
      });

      const contact = existingContact
        ? await prisma.contact.update({
            where: { id: existingContact.id },
            data: { isPortalUser: true },
          })
        : await prisma.contact.create({
            data: {
              companyId: company.id,
              contactType: "customer",
              displayName: normalizedEmail.split("@")[0] || "Portal Customer",
              email: normalizedEmail,
              isPortalUser: true,
            },
          });

      user = await prisma.user.update({
        where: { id: user.id },
        data: { contactId: contact.id },
        select: {
          id: true,
          role: true,
          tokenVersion: true,
          isActive: true,
          contactId: true,
          email: true,
        },
      });
    }

    req.user = { id: user.id, role: user.role, contactId: user.contactId };
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token", error));
  }
};
