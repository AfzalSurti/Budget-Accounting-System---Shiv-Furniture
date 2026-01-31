import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { auditLogger } from "./middlewares/auditLogger.js";
import { authRoutes } from "./routes/authRoutes.js";
import { masterDataRoutes } from "./routes/masterDataRoutes.js";
import { transactionRoutes } from "./routes/transactionRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";
import { portalRoutes } from "./routes/portalRoutes.js";
import { aiInsightsRoutes } from "./routes/aiInsightsRoutes.js";
import { uploadsRoutes } from "./routes/uploadsRoutes.js";
import { swaggerUi, swaggerSpec } from "./docs/swagger.js";
export const app = express();
app.use(helmet());
const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const configuredOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = env.CORS_ORIGIN === "*"
    ? true
    : Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins === true) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
}));
app.use(auditLogger);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", masterDataRoutes);
app.use("/api/v1", transactionRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/portal", portalRoutes);
app.use("/api/v1/ai-insights", aiInsightsRoutes);
app.use("/api/v1", uploadsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
//# sourceMappingURL=app.js.map