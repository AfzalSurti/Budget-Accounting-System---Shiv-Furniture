import { prisma } from "../config/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export const createBudget = async (data: {
  companyId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "approved" | "archived";
  createdBy?: string | null;
  lines: Array<{ analyticAccountId: string; glAccountId?: string | null; amount: number }>;
}) => {
  return prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        status: data.status,
        createdBy: data.createdBy ?? null,
      },
    });

    const revision = await tx.budgetRevision.create({
      data: {
        budgetId: budget.id,
        revisionNo: 1,
      },
    });

    if (data.lines.length > 0) {
      await tx.budgetLine.createMany({
        data: data.lines.map((line) => ({
          budgetRevisionId: revision.id,
          analyticAccountId: line.analyticAccountId,
          glAccountId: line.glAccountId ?? null,
          amount: line.amount,
        })),
      });
    }

    return { budget, revision };
  });
};

export const listBudgets = async (companyId: string) => {
  return prisma.budget.findMany({
    where: { companyId },
    include: { revisions: { include: { lines: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getBudget = async (id: string) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { revisions: { include: { lines: true } } },
  });
  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }
  return budget;
};

export const updateBudget = async (
  id: string,
  data: {
    name?: string;
    status?: "draft" | "approved" | "archived";
    periodStart?: string;
    periodEnd?: string;
    revisionReason?: string | null;
    createdBy?: string | null;
    lines?: Array<{ analyticAccountId: string; glAccountId?: string | null; amount: number }>;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.BudgetUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.periodStart !== undefined) updateData.periodStart = new Date(data.periodStart);
    if (data.periodEnd !== undefined) updateData.periodEnd = new Date(data.periodEnd);

    const budget = await tx.budget.update({
      where: { id },
      data: updateData,
    });

    const latestRevision = await tx.budgetRevision.findFirst({
      where: { budgetId: id },
      orderBy: { revisionNo: "desc" },
    });

    const nextRevisionNo = (latestRevision?.revisionNo ?? 0) + 1;
    const revision = await tx.budgetRevision.create({
      data: {
        budgetId: id,
        revisionNo: nextRevisionNo,
        revisionReason: data.revisionReason ?? null,
        createdBy: data.createdBy ?? null,
      },
    });

    if (data.lines && data.lines.length > 0) {
      await tx.budgetLine.createMany({
        data: data.lines.map((line) => ({
          budgetRevisionId: revision.id,
          analyticAccountId: line.analyticAccountId,
          glAccountId: line.glAccountId ?? null,
          amount: line.amount,
        })),
      });
    }

    return { budget, revision };
  });
};

export const archiveBudget = async (id: string) => {
  try {
    return await prisma.budget.update({ where: { id }, data: { status: "archived" } });
  } catch (error) {
    throw new ApiError(404, "Budget not found", error);
  }
};
