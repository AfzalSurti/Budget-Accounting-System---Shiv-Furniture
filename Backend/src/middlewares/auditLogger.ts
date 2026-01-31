import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (!req.user) return;
    if (!["POST", "PUT", "DELETE"].includes(req.method)) return;
    const entity = req.path.split("/")[1] || "unknown";
    const entityId = req.params.id ?? null;
    prisma.auditLog
      .create({
        data: {
          userId: req.user.id,
          action: req.method,
          entity,
          entityId,
          metadata: {
            statusCode: res.statusCode,
            body: req.body,
            query: req.query,
          },
        },
      })
      .catch(() => {});
  });
  next();
};
