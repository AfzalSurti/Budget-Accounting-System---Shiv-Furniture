import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
const signToken = (user) => {
    const options = {};
    if (env.JWT_EXPIRES_IN) {
        options.expiresIn = env.JWT_EXPIRES_IN;
    }
    return jwt.sign({ sub: user.id, role: user.role, tokenVersion: user.tokenVersion, contactId: user.contactId ?? null }, env.JWT_SECRET, options);
};
export const register = async (payload) => {
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
    const user = await prisma.user.create({
        data: {
            email: normalizedEmail,
            loginId: normalizedLoginId,
            passwordHash,
            role,
            contactId: payload.contactId ?? null,
        },
    });
    const token = signToken({ id: user.id, role: user.role, tokenVersion: user.tokenVersion, contactId: user.contactId });
    return { user, token };
};
export const login = async (identifier, password) => {
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
    const token = signToken({ id: user.id, role: user.role, tokenVersion: user.tokenVersion, contactId: user.contactId });
    return { user, token };
};
export const logout = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
    });
};
//# sourceMappingURL=authController.js.map