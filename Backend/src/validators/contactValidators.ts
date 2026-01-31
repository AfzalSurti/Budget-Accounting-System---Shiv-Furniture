import Joi from "joi";

const contactBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  contactType: Joi.string().valid("customer", "vendor", "both", "internal").required(),
  displayName: Joi.string().required(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  imgUrl: Joi.string().uri().allow(null, ""),
  gstin: Joi.string().allow(null, ""),
  billingAddress: Joi.any().optional(),
  shippingAddress: Joi.any().optional(),
  tags: Joi.array().items(Joi.string().trim().min(1)).optional(),
});

export const createContactSchema = Joi.object({
  body: contactBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updateContactSchema = Joi.object({
  body: contactBody.fork(["companyId", "contactType", "displayName"], (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().uuid().required() }),
  query: Joi.object({}),
});

export const listContactSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});

export const listContactTagSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});

export const createContactTagSchema = Joi.object({
  body: Joi.object({
    companyId: Joi.string().uuid().required(),
    name: Joi.string().required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});
