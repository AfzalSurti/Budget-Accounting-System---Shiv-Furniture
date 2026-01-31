import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import { ApiError } from "../utils/apiError.js";

export const validateRequest =
  (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(
      { body: req.body, params: req.params, query: req.query },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      return next(new ApiError(400, "Validation error", error.details));
    }

    req.body = value.body;
    req.params = value.params;
    req.query = value.query;
    return next();
  };
