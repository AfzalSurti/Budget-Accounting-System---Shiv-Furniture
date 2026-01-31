import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
export declare const validateRequest: (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateRequest.d.ts.map