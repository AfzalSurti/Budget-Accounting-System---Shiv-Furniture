import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
export const authenticateToken = async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next(new ApiError(401, "Missing or invalid authorization header"));
    }
    const token = authHeader.replace("Bearer ", "");
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const userId = payload.sub ?? payload.userId;
        if (!userId) {
            return next(new ApiError(401, "Invalid token payload"));
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                tokenVersion: true,
                isActive: true,
                contactId: true,
            },
        });
        if (!user || !user.isActive) {
            return next(new ApiError(401, "User not found or inactive"));
        }
        if (user.tokenVersion !== payload.tokenVersion) {
            return next(new ApiError(401, "Token has been revoked"));
        }
        req.user = { id: user.id, role: user.role, contactId: user.contactId };
        return next();
    }
    catch (error) {
        return next(new ApiError(401, "Invalid or expired token", error));
    }
};
//# sourceMappingURL=authenticateToken.js.map