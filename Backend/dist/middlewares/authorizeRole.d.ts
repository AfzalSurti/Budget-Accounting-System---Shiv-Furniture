import type { Request, Response, NextFunction } from "express";
export declare const authorizeRole: (roles: Array<"ADMIN" | "PORTAL">) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorizeRole.d.ts.map