import { ApiError } from "../utils/apiError.js";
export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const payload = {
        success: false,
        message: err.message || "Internal Server Error",
        details: err instanceof ApiError ? err.details : undefined,
    };
    res.status(statusCode).json(payload);
};
//# sourceMappingURL=errorHandler.js.map