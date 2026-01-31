import type { Prisma } from "../generated/prisma/client.js";
export declare const createBudget: (data: {
    companyId: string;
    name: string;
    periodStart: string;
    periodEnd: string;
    status: "draft" | "approved" | "archived";
    createdBy?: string | null;
    lines: Array<{
        analyticAccountId: string;
        glAccountId?: string | null;
        amount: number;
    }>;
}) => Promise<{
    budget: {
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        periodStart: Date;
        periodEnd: Date;
        status: import("../generated/prisma/index.js").$Enums.BudgetStatus;
        totalBudgeted: Prisma.Decimal;
        totalActual: Prisma.Decimal;
        totalRemaining: Prisma.Decimal;
        totalForecast: Prisma.Decimal;
        utilizationPct: Prisma.Decimal;
        createdBy: string | null;
        approvedAt: Date | null;
    };
    revision: {
        id: string;
        createdAt: Date;
        createdBy: string | null;
        revisionNo: number;
        revisionReason: string | null;
        budgetId: string;
    };
}>;
export declare const listBudgets: (companyId: string) => Promise<({
    revisions: ({
        lines: {
            id: string;
            analyticAccountId: string;
            glAccountId: string | null;
            amount: Prisma.Decimal;
            budgetRevisionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        createdBy: string | null;
        revisionNo: number;
        revisionReason: string | null;
        budgetId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
    status: import("../generated/prisma/index.js").$Enums.BudgetStatus;
    totalBudgeted: Prisma.Decimal;
    totalActual: Prisma.Decimal;
    totalRemaining: Prisma.Decimal;
    totalForecast: Prisma.Decimal;
    utilizationPct: Prisma.Decimal;
    createdBy: string | null;
    approvedAt: Date | null;
})[]>;
export declare const getBudget: (id: string) => Promise<{
    revisions: ({
        lines: {
            id: string;
            analyticAccountId: string;
            glAccountId: string | null;
            amount: Prisma.Decimal;
            budgetRevisionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        createdBy: string | null;
        revisionNo: number;
        revisionReason: string | null;
        budgetId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
    status: import("../generated/prisma/index.js").$Enums.BudgetStatus;
    totalBudgeted: Prisma.Decimal;
    totalActual: Prisma.Decimal;
    totalRemaining: Prisma.Decimal;
    totalForecast: Prisma.Decimal;
    utilizationPct: Prisma.Decimal;
    createdBy: string | null;
    approvedAt: Date | null;
}>;
export declare const updateBudget: (id: string, data: {
    name?: string;
    status?: "draft" | "approved" | "archived";
    periodStart?: string;
    periodEnd?: string;
    revisionReason?: string | null;
    createdBy?: string | null;
    lines?: Array<{
        analyticAccountId: string;
        glAccountId?: string | null;
        amount: number;
    }>;
}) => Promise<{
    budget: {
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        periodStart: Date;
        periodEnd: Date;
        status: import("../generated/prisma/index.js").$Enums.BudgetStatus;
        totalBudgeted: Prisma.Decimal;
        totalActual: Prisma.Decimal;
        totalRemaining: Prisma.Decimal;
        totalForecast: Prisma.Decimal;
        utilizationPct: Prisma.Decimal;
        createdBy: string | null;
        approvedAt: Date | null;
    };
    revision: {
        id: string;
        createdAt: Date;
        createdBy: string | null;
        revisionNo: number;
        revisionReason: string | null;
        budgetId: string;
    };
}>;
export declare const archiveBudget: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
    status: import("../generated/prisma/index.js").$Enums.BudgetStatus;
    totalBudgeted: Prisma.Decimal;
    totalActual: Prisma.Decimal;
    totalRemaining: Prisma.Decimal;
    totalForecast: Prisma.Decimal;
    utilizationPct: Prisma.Decimal;
    createdBy: string | null;
    approvedAt: Date | null;
}>;
//# sourceMappingURL=budgetController.d.ts.map