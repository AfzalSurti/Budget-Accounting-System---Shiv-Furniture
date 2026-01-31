import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { getContactTagIds, resolveAnalyticAccountId, } from "../services/autoAnalyticService.js";
import { calculatePaymentStatus } from "../services/paymentService.js";
import { formatBadgeLabel, formatCurrency, formatDate, mapDocStatusToBadge, } from "../utils/formatters.js";
import { assertDocStatusTransition } from "../utils/workflow.js";
import { renderDocumentPdf } from "../utils/pdf.js";
export const createInvoice = async (data) => {
    return prisma.$transaction(async (tx) => {
        const contactTagIds = await getContactTagIds(data.customerId);
        const invoice = await tx.customerInvoice.create({
            data: {
                companyId: data.companyId,
                customerId: data.customerId,
                invoiceNo: data.invoiceNo,
                invoiceDate: new Date(data.invoiceDate),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                status: data.status,
                currency: data.currency ?? "INR",
                soId: data.soId ?? null,
                paymentState: "not_paid",
            },
        });
        const productIds = Array.from(new Set(data.lines
            .map((line) => line.productId)
            .filter((id) => Boolean(id))));
        const products = productIds.length
            ? await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, categoryId: true },
            })
            : [];
        const productMap = new Map(products.map((product) => [product.id, product]));
        let totalAmount = 0;
        const linePayloads = await Promise.all(data.lines.map(async (line) => {
            const product = line.productId
                ? productMap.get(line.productId)
                : null;
            if (line.productId && !product) {
                throw new ApiError(400, "Invalid product");
            }
            const resolvedAnalytic = line.analyticAccountId
                ? null
                : await resolveAnalyticAccountId({
                    companyId: data.companyId,
                    docType: "customer_invoice",
                    productId: line.productId ?? null,
                    categoryId: product?.categoryId ?? null,
                    contactId: data.customerId,
                    contactTagIds,
                });
            const taxRate = line.taxRate ?? 0;
            const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
            totalAmount += lineTotal;
            return {
                customerInvoiceId: invoice.id,
                productId: line.productId ?? null,
                analyticAccountId: line.analyticAccountId ??
                    resolvedAnalytic?.analyticAccountId ??
                    null,
                autoAnalyticModelId: resolvedAnalytic?.modelId ?? null,
                autoAnalyticRuleId: resolvedAnalytic?.ruleId ?? null,
                matchedFieldsCount: resolvedAnalytic?.matchedFieldsCount ?? null,
                glAccountId: line.glAccountId ?? null,
                description: line.description ?? null,
                qty: line.qty,
                unitPrice: line.unitPrice,
                taxRate,
                lineTotal,
            };
        }));
        if (linePayloads.length > 0) {
            await tx.customerInvoiceLine.createMany({ data: linePayloads });
        }
        return tx.customerInvoice.update({
            where: { id: invoice.id },
            data: {
                totalAmount,
                paymentState: calculatePaymentStatus(0, totalAmount),
            },
        });
    }, { timeout: 15000 });
};
export const createInvoiceFromSO = async (soId, invoiceNo, invoiceDate) => {
    return prisma.$transaction(async (tx) => {
        const so = await tx.salesOrder.findUnique({
            where: { id: soId },
            include: { lines: true },
        });
        if (!so) {
            throw new ApiError(404, "Sales order not found");
        }
        const invoice = await tx.customerInvoice.create({
            data: {
                companyId: so.companyId,
                customerId: so.customerId,
                invoiceNo,
                invoiceDate: new Date(invoiceDate),
                status: "draft",
                currency: so.currency,
                soId: so.id,
                paymentState: "not_paid",
            },
        });
        let totalAmount = 0;
        for (const line of so.lines) {
            totalAmount += Number(line.lineTotal);
            await tx.customerInvoiceLine.create({
                data: {
                    customerInvoiceId: invoice.id,
                    productId: line.productId,
                    analyticAccountId: line.analyticAccountId,
                    description: line.description,
                    qty: Number(line.qty),
                    unitPrice: Number(line.unitPrice),
                    taxRate: Number(line.taxRate),
                    lineTotal: Number(line.lineTotal),
                },
            });
        }
        return tx.customerInvoice.update({
            where: { id: invoice.id },
            data: {
                totalAmount,
                paymentState: calculatePaymentStatus(0, totalAmount),
            },
        });
    });
};
export const listInvoices = async (companyId) => {
    return prisma.customerInvoice.findMany({
        where: { companyId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listInvoicesTable = async (companyId) => {
    const invoices = await prisma.customerInvoice.findMany({
        where: { companyId },
        select: {
            id: true,
            invoiceNo: true,
            invoiceDate: true,
            dueDate: true,
            totalAmount: true,
            paidAmount: true,
            currency: true,
            status: true,
            paymentState: true,
            customer: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return invoices.map((invoice) => ({
        id: invoice.invoiceNo,
        recordId: invoice.id,
        rawStatus: invoice.status,
        paymentState: invoice.paymentState,
        customer: invoice.customer.displayName,
        totalAmount: Number(invoice.totalAmount),
        paidAmount: Number(invoice.paidAmount ?? 0),
        amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
        dueDate: formatDate(invoice.dueDate) ?? "",
        issueDate: formatDate(invoice.invoiceDate) ?? "",
        status: mapDocStatusToBadge(invoice.status, invoice.paymentState),
        statusLabel: formatBadgeLabel(mapDocStatusToBadge(invoice.status, invoice.paymentState)),
    }));
};
export const getInvoice = async (id) => {
    const invoice = await prisma.customerInvoice.findUnique({
        where: { id },
        include: { lines: true },
    });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    return invoice;
};
export const updateInvoice = async (id, data) => {
    try {
        const current = await prisma.customerInvoice.findUnique({ where: { id } });
        if (!current) {
            throw new ApiError(404, "Invoice not found");
        }
        if (data.status) {
            assertDocStatusTransition(current.status, data.status);
        }
        const { totalAmount, paidAmount, paymentState, ...rest } = data;
        return await prisma.customerInvoice.update({ where: { id }, data: rest });
    }
    catch (error) {
        throw new ApiError(404, "Invoice not found", error);
    }
};
export const getInvoicePdf = async (id) => {
    const invoice = await prisma.customerInvoice.findUnique({
        where: { id },
        include: {
            company: true,
            customer: true,
            lines: { include: { product: true } },
        },
    });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    const lines = invoice.lines.map((line) => {
        const qty = Number(line.qty);
        const unit = Number(line.unitPrice);
        const taxRate = Number(line.taxRate);
        return {
            description: line.description ?? line.product?.name ?? "Item",
            qty,
            unitPrice: unit,
            taxRate,
            lineTotal: Number(line.lineTotal),
        };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const taxTotal = grandTotal - subtotal;
    const statusLabel = formatBadgeLabel(mapDocStatusToBadge(invoice.status, invoice.paymentState));
    const buffer = await renderDocumentPdf({
        title: "Customer Invoice",
        companyName: invoice.company.name,
        docNo: invoice.invoiceNo,
        docDate: formatDate(invoice.invoiceDate) ?? "",
        contactLabel: "Customer",
        contactName: invoice.customer.displayName,
        statusLabel,
        currency: invoice.currency,
        paymentStatus: invoice.paymentState,
    }, lines, { subtotal, taxTotal, grandTotal });
    return {
        buffer,
        filename: `${invoice.invoiceNo}.pdf`,
    };
};
export const resolvePurchaseOrderCostCenter = async (data) => {
    const contactTagIds = await getContactTagIds(data.vendorId);
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { categoryId: true, name: true },
    });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    const resolved = await resolveAnalyticAccountId({
        companyId: data.companyId,
        docType: "purchase_order",
        productId: data.productId,
        categoryId: product.categoryId,
        contactId: data.vendorId,
        contactTagIds,
    });
    let analyticAccountId = resolved?.analyticAccountId;
    let mode = resolved ? "rule" : "fallback";
    if (!analyticAccountId) {
        const operationsAccount = await prisma.analyticAccount.findFirst({
            where: {
                companyId: data.companyId,
                name: "Operations",
                isActive: true,
            },
        });
        if (operationsAccount) {
            analyticAccountId = operationsAccount.id;
            mode = "fallback";
        }
        else {
            const anyAccount = await prisma.analyticAccount.findFirst({
                where: {
                    companyId: data.companyId,
                    isActive: true,
                },
            });
            if (anyAccount) {
                analyticAccountId = anyAccount.id;
                mode = "fallback";
            }
            else {
                const newAccount = await prisma.analyticAccount.create({
                    data: {
                        companyId: data.companyId,
                        name: "Operations",
                        code: "OPS-001",
                        isActive: true,
                    },
                });
                analyticAccountId = newAccount.id;
                mode = "created";
            }
        }
    }
    const analyticAccount = await prisma.analyticAccount.findUnique({
        where: { id: analyticAccountId },
        select: { id: true, name: true },
    });
    console.log("Auto cost center resolved:", {
        analyticAccountId,
        analyticAccountName: analyticAccount?.name,
        modelId: resolved?.modelId,
        ruleId: resolved?.ruleId,
        matchedFieldsCount: resolved?.matchedFieldsCount,
        mode,
    });
    return {
        analyticAccountId,
        analyticAccountName: analyticAccount?.name,
        modelId: resolved?.modelId,
        ruleId: resolved?.ruleId,
        matchedFieldsCount: resolved?.matchedFieldsCount,
        mode,
    };
};
//# sourceMappingURL=invoiceController.js.map