import { ApiError } from "../utils/apiError.js";
export const authorizeRole = (roles) => (req, _res, next) => {
    if (!req.user) {
        return next(new ApiError(401, "Unauthorized"));
    }
    if (!roles.includes(req.user.role)) {
        return next(new ApiError(403, "Forbidden"));
    }
    return next();
};
//# sourceMappingURL=authorizeRole.js.map