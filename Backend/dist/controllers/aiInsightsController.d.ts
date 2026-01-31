export declare const listRiskInsights: (companyId: string, start: Date, end: Date) => Promise<({
    id: string;
    type: "invoice";
    title: string;
    counterparty: string;
    amount: string;
    dueDate: string | null;
    confidence: number;
} | {
    id: string;
    type: "vendor_bill";
    title: string;
    counterparty: string;
    amount: string;
    dueDate: string | null;
    confidence: number;
})[]>;
export declare const listOpportunityInsights: (companyId: string, start: Date, end: Date) => Promise<{
    id: string;
    title: string;
    analyticAccountId: string | null;
    budgetedAmount: number;
    actualAmount: number;
    remainingAmount: number;
    confidence: number;
}[]>;
export declare const listAnomalyInsights: (companyId: string, start: Date, end: Date) => Promise<({
    id: string;
    type: "invoice";
    title: string;
    counterparty: string;
    amount: string;
    date: string | null;
    confidence: number;
} | {
    id: string;
    type: "payment";
    title: string;
    counterparty: string;
    amount: string;
    date: string | null;
    confidence: number;
})[]>;
//# sourceMappingURL=aiInsightsController.d.ts.map