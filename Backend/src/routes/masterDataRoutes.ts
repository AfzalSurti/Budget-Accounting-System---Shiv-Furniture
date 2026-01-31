import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as contactController from "../controllers/contactController.js";
import * as productController from "../controllers/productController.js";
import * as analyticController from "../controllers/analyticAccountController.js";
import * as budgetController from "../controllers/budgetController.js";
import * as autoAnalyticController from "../controllers/autoAnalyticController.js";

import {
  createContactSchema,
  updateContactSchema,
  listContactSchema,
  listContactTagSchema,
  createContactTagSchema,
} from "../validators/contactValidators.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductSchema,
  listProductCategorySchema,
} from "../validators/productValidators.js";
import {
  createAnalyticAccountSchema,
  updateAnalyticAccountSchema,
  listAnalyticAccountSchema,
} from "../validators/analyticAccountValidators.js";
import { createBudgetSchema, updateBudgetSchema, listBudgetSchema } from "../validators/budgetValidators.js";
import {
  createAutoAnalyticSchema,
  updateAutoAnalyticSchema,
  listAutoAnalyticSchema,
} from "../validators/autoAnalyticValidators.js";

export const masterDataRoutes = Router();

masterDataRoutes.use(authenticateToken, authorizeRole(["ADMIN"]));

// Contacts
masterDataRoutes.post(
  "/contacts",
  validateRequest(createContactSchema),
  asyncHandler(async (req, res) => {
    const contact = await contactController.createContact(req.body);
    res.status(201).json({ success: true, data: contact });
  })
);

masterDataRoutes.get(
  "/contacts",
  validateRequest(listContactSchema),
  asyncHandler(async (req, res) => {
    const contacts = await contactController.listContacts(req.query.companyId as string);
    res.json({ success: true, data: contacts });
  })
);

// Contact Tags
masterDataRoutes.get(
  "/contact-tags",
  validateRequest(listContactTagSchema),
  asyncHandler(async (req, res) => {
    const tags = await contactController.listContactTags(req.query.companyId as string);
    res.json({ success: true, data: tags });
  })
);

masterDataRoutes.post(
  "/contact-tags",
  validateRequest(createContactTagSchema),
  asyncHandler(async (req, res) => {
    const tag = await contactController.createContactTag(req.body);
    res.status(201).json({ success: true, data: tag });
  })
);

masterDataRoutes.get(
  "/contacts/:id",
  asyncHandler(async (req, res) => {
    const contact = await contactController.getContact(req.params.id!);
    res.json({ success: true, data: contact });
  })
);

masterDataRoutes.put(
  "/contacts/:id",
  validateRequest(updateContactSchema),
  asyncHandler(async (req, res) => {
    const contact = await contactController.updateContact(req.params.id!, req.body);
    res.json({ success: true, data: contact });
  })
);

masterDataRoutes.delete(
  "/contacts/:id",
  asyncHandler(async (req, res) => {
    const contact = await contactController.archiveContact(req.params.id!);
    res.json({ success: true, data: contact });
  })
);

// Products
masterDataRoutes.post(
  "/products",
  validateRequest(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await productController.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  })
);

masterDataRoutes.get(
  "/products",
  validateRequest(listProductSchema),
  asyncHandler(async (req, res) => {
    const products = await productController.listProducts(req.query.companyId as string);
    res.json({ success: true, data: products });
  })
);

masterDataRoutes.get(
  "/product-categories",
  validateRequest(listProductCategorySchema),
  asyncHandler(async (req, res) => {
    const categories = await productController.listProductCategories(req.query.companyId as string);
    res.json({ success: true, data: categories });
  })
);

masterDataRoutes.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const product = await productController.getProduct(req.params.id!);
    res.json({ success: true, data: product });
  })
);

masterDataRoutes.put(
  "/products/:id",
  validateRequest(updateProductSchema),
  asyncHandler(async (req, res) => {
    const product = await productController.updateProduct(req.params.id!, req.body);
    res.json({ success: true, data: product });
  })
);

masterDataRoutes.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const product = await productController.archiveProduct(req.params.id!);
    res.json({ success: true, data: product });
  })
);

// Analytical Accounts
masterDataRoutes.post(
  "/analytical-accounts",
  validateRequest(createAnalyticAccountSchema),
  asyncHandler(async (req, res) => {
    const account = await analyticController.createAnalyticAccount(req.body);
    res.status(201).json({ success: true, data: account });
  })
);

masterDataRoutes.get(
  "/analytical-accounts",
  validateRequest(listAnalyticAccountSchema),
  asyncHandler(async (req, res) => {
    const accounts = await analyticController.listAnalyticAccounts(req.query.companyId as string);
    res.json({ success: true, data: accounts });
  })
);

masterDataRoutes.get(
  "/analytical-accounts/:id",
  asyncHandler(async (req, res) => {
    const account = await analyticController.getAnalyticAccount(req.params.id!);
    res.json({ success: true, data: account });
  })
);

masterDataRoutes.put(
  "/analytical-accounts/:id",
  validateRequest(updateAnalyticAccountSchema),
  asyncHandler(async (req, res) => {
    const account = await analyticController.updateAnalyticAccount(req.params.id!, req.body);
    res.json({ success: true, data: account });
  })
);

masterDataRoutes.delete(
  "/analytical-accounts/:id",
  asyncHandler(async (req, res) => {
    const account = await analyticController.archiveAnalyticAccount(req.params.id!);
    res.json({ success: true, data: account });
  })
);

// Budgets
masterDataRoutes.post(
  "/budgets",
  validateRequest(createBudgetSchema),
  asyncHandler(async (req, res) => {
    const result = await budgetController.createBudget(req.body);
    res.status(201).json({ success: true, data: result });
  })
);

masterDataRoutes.get(
  "/budgets",
  validateRequest(listBudgetSchema),
  asyncHandler(async (req, res) => {
    const budgets = await budgetController.listBudgets(req.query.companyId as string);
    res.json({ success: true, data: budgets });
  })
);

masterDataRoutes.get(
  "/budgets/:id",
  asyncHandler(async (req, res) => {
    const budget = await budgetController.getBudget(req.params.id!);
    res.json({ success: true, data: budget });
  })
);

masterDataRoutes.put(
  "/budgets/:id",
  validateRequest(updateBudgetSchema),
  asyncHandler(async (req, res) => {
    const result = await budgetController.updateBudget(req.params.id!, req.body);
    res.json({ success: true, data: result });
  })
);

masterDataRoutes.delete(
  "/budgets/:id",
  asyncHandler(async (req, res) => {
    const budget = await budgetController.archiveBudget(req.params.id!);
    res.json({ success: true, data: budget });
  })
);

// Auto Analytical Models
masterDataRoutes.post(
  "/auto-analytical-models",
  validateRequest(createAutoAnalyticSchema),
  asyncHandler(async (req, res) => {
    const model = await autoAnalyticController.createAutoAnalyticModel(req.body);
    res.status(201).json({ success: true, data: model });
  })
);

masterDataRoutes.get(
  "/auto-analytical-models",
  validateRequest(listAutoAnalyticSchema),
  asyncHandler(async (req, res) => {
    const models = await autoAnalyticController.listAutoAnalyticModels(req.query.companyId as string);
    res.json({ success: true, data: models });
  })
);

masterDataRoutes.get(
  "/auto-analytical-models/:id",
  asyncHandler(async (req, res) => {
    const model = await autoAnalyticController.getAutoAnalyticModel(req.params.id!);
    res.json({ success: true, data: model });
  })
);

masterDataRoutes.put(
  "/auto-analytical-models/:id",
  validateRequest(updateAutoAnalyticSchema),
  asyncHandler(async (req, res) => {
    const model = await autoAnalyticController.updateAutoAnalyticModel(req.params.id!, req.body);
    res.json({ success: true, data: model });
  })
);

masterDataRoutes.delete(
  "/auto-analytical-models/:id",
  asyncHandler(async (req, res) => {
    const model = await autoAnalyticController.archiveAutoAnalyticModel(req.params.id!);
    res.json({ success: true, data: model });
  })
);
