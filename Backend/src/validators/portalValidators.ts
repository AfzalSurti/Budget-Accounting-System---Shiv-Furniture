import Joi from "joi";

export const portalListSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    view: Joi.string().valid("table", "raw").optional(),
  }),
});

export const portalPaymentSchema = Joi.object({
  body: Joi.object({
    companyId: Joi.string().uuid().required(),
    paymentDate: Joi.alternatives().try(
      Joi.date(),
      Joi.string().isoDate()
    ).required(),
    method: Joi.string()
      .valid("cash", "bank", "upi", "card", "online", "other")
      .required(),
    reference: Joi.string().allow(null, "").optional(),
    amount: Joi.number().required(),
    allocations: Joi.array()
      .items(
        Joi.object({
          targetType: Joi.string()
            .valid("customer_invoice", "vendor_bill")
            .required(),
          targetId: Joi.string().uuid().required(),
          amount: Joi.number().required(),
        }),
      )
      .default([]),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});
