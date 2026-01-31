export declare const budgetVsActual: (companyId: string, start: Date, end: Date) => Promise<{
    analyticAccountId: string | null;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    achievementPercentage: number;
    remainingBalance: number;
}[]>;
export declare const budgetDashboardSummary: (companyId: string, start: Date, end: Date) => Promise<{
    variance: number;
    achievementPercentage: number;
    budgeted: number;
    actual: number;
}>;
export declare const budgetTopOverUnder: (companyId: string, start: Date, end: Date, limit: number, direction: "over" | "under") => Promise<{
    analyticAccountId: string | null;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    achievementPercentage: number;
    remainingBalance: number;
}[]>;
export declare const budgetTrend: (companyId: string, start: Date, end: Date) => Promise<{
    period: string;
    actualAmount: number;
    budgetedAmount: number;
    forecastAmount: number;
}[]>;
//# sourceMappingURL=reportService.d.ts.map