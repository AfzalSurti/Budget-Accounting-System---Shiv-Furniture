import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { aiInsightsRangeSchema } from "../validators/aiInsightsValidators.js";
import * as aiInsightsController from "../controllers/aiInsightsController.js";

export const aiInsightsRoutes = Router();

aiInsightsRoutes.use(authenticateToken, authorizeRole(["ADMIN"]));

const parseRange = (req: { query: Record<string, unknown> }) => {
  const { companyId, start, end } = req.query as {
    companyId: string;
    start: string;
    end: string;
  };
  return { companyId, start: new Date(start), end: new Date(end) };
};

aiInsightsRoutes.get(
  "/risks",
  validateRequest(aiInsightsRangeSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await aiInsightsController.listRiskInsights(
      companyId,
      start,
      end,
    );
    res.json({ success: true, data });
  }),
);

aiInsightsRoutes.get(
  "/opportunities",
  validateRequest(aiInsightsRangeSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await aiInsightsController.listOpportunityInsights(
      companyId,
      start,
      end,
    );
    res.json({ success: true, data });
  }),
);

aiInsightsRoutes.get(
  "/anomalies",
  validateRequest(aiInsightsRangeSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await aiInsightsController.listAnomalyInsights(
      companyId,
      start,
      end,
    );
    res.json({ success: true, data });
  }),
);
