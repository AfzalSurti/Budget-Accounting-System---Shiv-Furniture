import Joi from "joi";
const allocationSchema = Joi.object({
    targetType: Joi.string().valid("customer_invoice", "vendor_bill").required(),
    targetId: Joi.string().uuid().required(),
    amount: Joi.number().required(),
});
const paymentBody = Joi.object({
    companyId: Joi.string().uuid().required(),
    direction: Joi.string().valid("inbound", "outbound").required(),
    contactId: Joi.string().uuid().required(),
    paymentDate: Joi.date().required(),
    method: Joi.string().valid("cash", "bank", "upi", "card", "online", "other").required(),
    reference: Joi.string().allow(null, ""),
    amount: Joi.number().required(),
    status: Joi.string().valid("draft", "posted", "void").required(),
    allocations: Joi.array().items(allocationSchema).default([]),
});
export const createPaymentSchema = Joi.object({
    body: paymentBody,
    params: Joi.object({}),
    query: Joi.object({}),
});
export const listPaymentSchema = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
//# sourceMappingURL=paymentValidators.js.map