import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const prismaCode = (err as { code?: string }).code;
  if (prismaCode === "P2002") {
    const meta = (err as { meta?: { target?: string[] | string } }).meta;
    const target = Array.isArray(meta?.target)
      ? meta?.target.join(", ")
      : meta?.target;
    const friendly =
      target && target.includes("email")
        ? "Email already exists for this company. Please use a different email."
        : "Duplicate value for a unique field. Please use different data.";
    res.status(400).json({
      success: false,
      message: friendly,
    });
    return;
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const payload = {
    success: false,
    message: err.message || "Internal Server Error",
    details: err instanceof ApiError ? err.details : undefined,
  };

  res.status(statusCode).json(payload);
};
