import { ApiError } from "../utils/apiError.js";
export const validateRequest = (schema) => (req, _res, next) => {
    const { error, value } = schema.validate({ body: req.body, params: req.params, query: req.query }, { abortEarly: false, stripUnknown: true });
    if (error) {
        return next(new ApiError(400, "Validation error", error.details));
    }
    req.body = value.body;
    req.params = value.params;
    req.query = value.query;
    return next();
};
//# sourceMappingURL=validateRequest.js.map