import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  budgetVsActual,
  budgetDashboardSummary,
  budgetTopOverUnder,
  budgetTrend,
} from "../services/reportService.js";
import { budgetVsActualSchema } from "../validators/reportValidators.js";

export const reportRoutes = Router();

reportRoutes.use(authenticateToken, authorizeRole(["ADMIN"]));

const parseRange = (req: { query: Record<string, unknown> }) => {
  const { companyId, start, end } = req.query as { companyId: string; start: string; end: string };
  return { companyId, start: new Date(start), end: new Date(end) };
};

reportRoutes.get(
  "/budget-vs-actual",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetVsActual(companyId, start, end);
    res.json({ success: true, data });
  })
);

reportRoutes.get(
  "/budget-achievement",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetVsActual(companyId, start, end);
    res.json({ success: true, data });
  })
);

reportRoutes.get(
  "/dashboard/summary",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetDashboardSummary(companyId, start, end);
    res.json({ success: true, data });
  })
);

reportRoutes.get(
  "/dashboard/top-over-budget",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetTopOverUnder(companyId, start, end, 5, "over");
    res.json({ success: true, data });
  })
);

reportRoutes.get(
  "/dashboard/top-under-budget",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetTopOverUnder(companyId, start, end, 5, "under");
    res.json({ success: true, data });
  })
);

reportRoutes.get(
  "/dashboard/trends",
  validateRequest(budgetVsActualSchema),
  asyncHandler(async (req, res) => {
    const { companyId, start, end } = parseRange(req);
    const data = await budgetTrend(companyId, start, end);
    res.json({ success: true, data });
  })
);
