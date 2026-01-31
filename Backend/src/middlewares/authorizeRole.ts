import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export const authorizeRole =
  (roles: Array<"ADMIN" | "PORTAL">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }
    return next();
  };
