import Joi from "joi";

const lineSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  analyticAccountId: Joi.string().uuid().allow(null),
  description: Joi.string().allow(null, ""),
  qty: Joi.number().required(),
  unitPrice: Joi.number().required(),
  taxRate: Joi.number().default(0),
});

const soBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().required(),
  soNo: Joi.string().required(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().allow(null),
  status: Joi.string()
    .valid("draft", "confirmed", "cancelled", "done")
    .required(),
  currency: Joi.string().default("INR"),
  notes: Joi.string().allow(null, ""),
  lines: Joi.array().items(lineSchema).min(1).required(),
});

export const createSalesOrderSchema = Joi.object({
  body: soBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updateSalesOrderSchema = Joi.object({
  body: soBody.fork(
    [
      "companyId",
      "customerId",
      "soNo",
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

export const listSalesOrderSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    companyId: Joi.string().uuid().required(),
    view: Joi.string().valid("table", "raw").optional(),
  }),
});
