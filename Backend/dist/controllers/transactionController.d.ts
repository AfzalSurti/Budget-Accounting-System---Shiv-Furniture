export interface CreateTransactionPayload {
    entryDate: string;
    memo?: string;
    lines: Array<{
        glAccountId: string;
        analyticAccountId?: string;
        contactId?: string;
        productId?: string;
        description?: string;
        debit?: number;
        credit?: number;
    }>;
}
export interface TransactionResponse {
    id: string;
    entryDate: string;
    status: string;
    memo?: string;
    createdAt: string;
    lines: Array<{
        id: string;
        description?: string;
        debit: number;
        credit: number;
        glAccount: {
            id: string;
            name: string;
        };
    }>;
}
export declare function createTransaction(userId: string, payload: CreateTransactionPayload & {
    companyId: string;
}): Promise<TransactionResponse>;
export declare function getTransactions(companyId: string, limit?: number, offset?: number): Promise<{
    transactions: TransactionResponse[];
    total: number;
}>;
export declare function getTransactionById(id: string, companyId: string): Promise<TransactionResponse | null>;
//# sourceMappingURL=transactionController.d.ts.map