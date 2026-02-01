import Joi from "joi";

const lineSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  analyticAccountId: Joi.string().uuid().allow(null),
  description: Joi.string().allow(null, ""),
  qty: Joi.number().required(),
  unitPrice: Joi.number().required(),
  taxRate: Joi.number().default(0),
});

const poBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  vendorId: Joi.string().uuid().required(),
  poNo: Joi.string().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().allow(null),
  status: Joi.string()
    .valid("draft", "confirmed", "cancelled", "done")
    .required(),
  currency: Joi.string().default("INR"),
  notes: Joi.string().allow(null, ""),
  lines: Joi.array().items(lineSchema).min(1).required(),
});

export const createPurchaseOrderSchema = Joi.object({
  body: poBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updatePurchaseOrderSchema = Joi.object({
  body: poBody.fork(
    [
      "companyId",
      "vendorId",
      "poNo",
      "orderDate",
      "deliveryDate",
      "status",
      "lines",
    ],
    (schema) => schema.optional(),
  ),
  params: Joi.object({ id: Joi.string().uuid().required() }),
  query: Joi.object({}),
});

export const listPurchaseOrderSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    companyId: Joi.string().uuid().required(),
    view: Joi.string().valid("table", "raw").optional(),
  }),
});

export const resolvePurchaseOrderCostCenterSchema = Joi.object({
  body: Joi.object({
    companyId: Joi.string().uuid().required(),
    vendorId: Joi.string().uuid().required(),
    productId: Joi.string().uuid().required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});
