import Joi from "joi";

export const aiInsightsRangeSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    companyId: Joi.string().uuid().required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
  }),
});
