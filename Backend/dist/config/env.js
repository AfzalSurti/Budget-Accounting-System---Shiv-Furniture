import "dotenv/config";
import Joi from "joi";
const schema = Joi.object({
    NODE_ENV: Joi.string()
        .valid("development", "test", "production")
        .default("development"),
    PORT: Joi.number().default(4000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default("1d"),
    CORS_ORIGIN: Joi.string().default("http://localhost:3000"),
}).unknown(true);
const { value, error } = schema.validate(process.env, { abortEarly: false });
if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
}
export const env = value;
//# sourceMappingURL=env.js.map