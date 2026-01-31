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
    const { email, password, role, contactId } = req.body;

    if (role === "ADMIN") {
      throw new ApiError(403, "Admin registration is restricted");
    }

    const result = await authController.register({ email, password, role, contactId });
    res.status(201).json({ success: true, data: result });
  })
);

authRoutes.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authController.login(email, password);
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
      select: { id: true, email: true, role: true, contactId: true, isActive: true, createdAt: true },
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
    const { email, password, role, contactId } = req.body;
    const result = await authController.register({ email, password, role, contactId });
    res.status(201).json({ success: true, data: result });
  })
);
