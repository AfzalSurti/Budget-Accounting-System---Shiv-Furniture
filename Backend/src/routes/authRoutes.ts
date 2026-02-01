import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";
import * as authController from "../controllers/authController.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, loginId, password, role, contactId, companyId, fullName } = req.body;

    if (role === "ADMIN") {
      throw new ApiError(403, "Admin registration is restricted");
    }

    const result = await authController.register({
      email,
      loginId,
      password,
      role,
      contactId,
      companyId,
      fullName,
    });
    res.status(201).json({ success: true, data: result });
  })
);

authRoutes.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const result = await authController.login(identifier, password);
    res.json({ success: true, data: result });
  })
);

authRoutes.post(
  "/logout",
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    await authController.logout(req.user.id);
    res.json({ success: true });
  })
);

authRoutes.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, loginId: true, role: true, contactId: true, isActive: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  })
);

authRoutes.post(
  "/register-admin",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, loginId, password, role, contactId, companyId, fullName } = req.body;
    const result = await authController.register({
      email,
      loginId,
      password,
      role,
      contactId,
      companyId,
      fullName,
    });
    res.status(201).json({ success: true, data: result });
  })
);
authRoutes.post(
  "/link-contact",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
      throw new ApiError(400, "userId and contactId are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "PORTAL") {
      throw new ApiError(400, "Can only link portal users to contacts");
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new ApiError(404, "Contact not found");
    }

    // Update the user with the new contactId
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { contactId },
      select: {
        id: true,
        email: true,
        loginId: true,
        role: true,
        contactId: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: updatedUser });
  })
);