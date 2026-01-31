import { ApiError } from "./apiError.js";
const ORDER_TRANSITIONS = {
    draft: ["confirmed", "cancelled"],
    confirmed: ["done", "cancelled"],
    cancelled: [],
    done: [],
};
const DOC_TRANSITIONS = {
    draft: ["posted", "cancelled"],
    posted: ["cancelled"],
    cancelled: [],
};
export const assertOrderStatusTransition = (current, next) => {
    if (current === next)
        return;
    if (!ORDER_TRANSITIONS[current].includes(next)) {
        throw new ApiError(400, `Invalid order status transition: ${current} -> ${next}`);
    }
};
export const assertDocStatusTransition = (current, next) => {
    if (current === next)
        return;
    if (!DOC_TRANSITIONS[current].includes(next)) {
        throw new ApiError(400, `Invalid document status transition: ${current} -> ${next}`);
    }
};
//# sourceMappingURL=workflow.js.map