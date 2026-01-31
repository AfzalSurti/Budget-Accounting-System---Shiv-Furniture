type OrderStatus = "draft" | "confirmed" | "cancelled" | "done";
type DocStatus = "draft" | "posted" | "cancelled";
export declare const assertOrderStatusTransition: (current: OrderStatus, next: OrderStatus) => void;
export declare const assertDocStatusTransition: (current: DocStatus, next: DocStatus) => void;
export {};
//# sourceMappingURL=workflow.d.ts.map