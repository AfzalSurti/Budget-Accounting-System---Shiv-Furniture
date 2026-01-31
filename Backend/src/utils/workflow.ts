import { ApiError } from "./apiError.js";

type OrderStatus = "draft" | "confirmed" | "cancelled" | "done";
type DocStatus = "draft" | "posted" | "cancelled";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["done", "cancelled"],
  cancelled: [],
  done: [],
};

const DOC_TRANSITIONS: Record<DocStatus, DocStatus[]> = {
  draft: ["posted", "cancelled"],
  posted: ["cancelled"],
  cancelled: [],
};

export const assertOrderStatusTransition = (current: OrderStatus, next: OrderStatus) => {
  if (current === next) return;
  if (!ORDER_TRANSITIONS[current].includes(next)) {
    throw new ApiError(400, `Invalid order status transition: ${current} -> ${next}`);
  }
};

export const assertDocStatusTransition = (current: DocStatus, next: DocStatus) => {
  if (current === next) return;
  if (!DOC_TRANSITIONS[current].includes(next)) {
    throw new ApiError(400, `Invalid document status transition: ${current} -> ${next}`);
  }
};
