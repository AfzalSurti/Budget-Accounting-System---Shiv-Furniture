import Joi from "joi";
export const registerSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        loginId: Joi.string().alphanum().length(6).uppercase().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid("ADMIN", "PORTAL").optional(),
        contactId: Joi.string().uuid().allow(null).optional(),
    }),
    params: Joi.object({}),
    query: Joi.object({}),
});
export const loginSchema = Joi.object({
    body: Joi.object({
        identifier: Joi.string().required(),
        password: Joi.string().required(),
    }),
    params: Joi.object({}),
    query: Joi.object({}),
});
//# sourceMappingURL=authValidators.js.map