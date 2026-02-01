import Joi from "joi";

export const listGlAccountSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
