"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiDownload, apiGet, apiPost, apiPut } from "@/lib/api";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { Download, Plus } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface SalesOrderRow {
  id: string;
  recordId?: string;
  rawStatus?: "draft" | "confirmed" | "cancelled" | "done";
  customer: string;
  date: string;
  amount: string;
  status: StatusType;
  statusLabel?: string;
  deliveryDate: string;
}

interface BackendContact {
  id: string;
  displayName: string;
  contactType: "customer" | "vendor" | "both" | "internal";
  isPortalUser?: boolean;
}

interface BackendProduct {
  id: string;
  name: string;
  sku?: string | null;
  salePrice?: number;
}

interface CostCenter {
  id: string;
  name: string;
}

interface LineDraft {
  productId: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  analyticAccountId: string;
  description: string;
}

interface SalesOrderDraft {
  customerId: string;
  soNo: string;
  orderDate: string;
  deliveryDate: string;
  status: "draft" | "confirmed" | "cancelled" | "done";
  currency: string;
  notes: string;
  lines: LineDraft[];
}

export default function SalesOrdersPage() {
  const [salesOrdersData, setSalesOrdersData] = useState<SalesOrderRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<BackendContact[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customers = useMemo(
    () => contacts.filter((row) => row.contactType === "customer" || row.contactType === "both"),
    [contacts],
  );

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiGet<SalesOrderRow[]>(
        `/sales-orders?companyId=${DEFAULT_COMPANY_ID}&view=table`,
      );
      setSalesOrdersData(data ?? []);
    } catch (loadError) {
      console.error("Failed to load sales orders:", loadError);
    }
  }, []);

  const loadLookups = useCallback(async () => {
    try {
      const [contactsData, productsData, centersData] = await Promise.all([
        apiGet<BackendContact[]>(`/contacts?companyId=${DEFAULT_COMPANY_ID}`),
        apiGet<BackendProduct[]>(`/products?companyId=${DEFAULT_COMPANY_ID}`),
        apiGet<CostCenter[]>(`/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`),
      ]);
      setContacts(contactsData ?? []);
      setProducts(productsData ?? []);
      setCostCenters(centersData ?? []);
    } catch (loadError) {
      console.error("Failed to load sales order lookups:", loadError);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadLookups();
  }, [loadOrders, loadLookups]);

  const handleExportPDF = () => {
    const columns = [
      { header: "Date", key: "date" },
      { header: "SO #", key: "id" },
      { header: "Customer", key: "customer" },
      { header: "Amount", key: "amount" },
      { header: "Delivery Date", key: "deliveryDate" },
      { header: "Status", key: "status" },
    ];

    const processedData = salesOrdersData.map((row) => ({
      ...row,
      status: row.statusLabel ?? row.status,
    }));

    exportTableToPDF("Sales Orders", columns, processedData, "sales-orders.pdf");
  };

  const handleUpdateStatus = async (row: SalesOrderRow, status: "confirmed" | "done") => {
    if (!row.recordId) return;
    try {
      await apiPut(`/sales-orders/${row.recordId}`, { status });
      await loadOrders();
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "Failed to update status";
      setError(message);
    }
  };

  const handleGenerateInvoice = async (row: SalesOrderRow) => {
    if (!row.recordId) return;
    const invoiceNo = window.prompt("Enter Invoice Number");
    if (!invoiceNo) return;
    const invoiceDate =
      window.prompt("Invoice Date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10)) ??
      "";
    if (!invoiceDate) return;
    try {
      await apiPost(`/invoices/from-so/${row.recordId}`, {
        invoiceNo,
        invoiceDate,
      });
      await loadOrders();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to generate invoice";
      setError(message);
    }
  };

  const handleDownloadPdf = async (row: SalesOrderRow) => {
    if (!row.recordId) return;
    try {
      await apiDownload(`/so/${row.recordId}/pdf`, `${row.id}.pdf`);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error ? downloadError.message : "Failed to download PDF";
      setError(message);
    }
  };

  const columns = [
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
    },
    {
      key: "id" as const,
      label: "SO #",
      sortable: true,
    },
    {
      key: "customer" as const,
      label: "Customer",
    },
    {
      key: "amount" as const,
      label: "Amount",
      className: "font-mono font-bold",
    },
    {
      key: "deliveryDate" as const,
      label: "Delivery Date",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string, row: SalesOrderRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
    {
      key: "recordId" as const,
      label: "Actions",
      render: (_value: string | undefined, row: SalesOrderRow) => (
        <div className="flex flex-wrap gap-2">
          {row.rawStatus === "draft" && (
            <button
              onClick={() => handleUpdateStatus(row, "confirmed")}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              Confirm
            </button>
          )}
          {row.rawStatus === "confirmed" && (
            <button
              onClick={() => handleUpdateStatus(row, "done")}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              Mark Done
            </button>
          )}
          {(row.rawStatus === "confirmed" || row.rawStatus === "done") && (
            <button
              onClick={() => handleGenerateInvoice(row)}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Generate Invoice
            </button>
          )}
          <button
            onClick={() => handleDownloadPdf(row)}
            className="text-xs font-semibold text-slate-600 hover:underline"
          >
            PDF
          </button>
        </div>
      ),
    },
  ];

  const handleCreateSalesOrder = async (draft: SalesOrderDraft) => {
    setIsSaving(true);
    setError(null);
    try {
      const so = await apiPost<{ id: string }>("/sales-orders", {
        companyId: DEFAULT_COMPANY_ID,
        customerId: draft.customerId,
        soNo: draft.soNo,
        orderDate: draft.orderDate,
        deliveryDate: draft.deliveryDate ? draft.deliveryDate : null,
        status: draft.status,
        currency: draft.currency || "INR",
        notes: draft.notes ? draft.notes : null,
        lines: draft.lines.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.analyticAccountId || null,
          description: line.description || null,
          qty: Number(line.qty),
          unitPrice: Number(line.unitPrice),
          taxRate: Number(line.taxRate) || 0,
        })),
      });
      if (so?.id) {
        const invoiceNoBase = `INV-${draft.soNo}`;
        try {
          await apiPost(`/invoices/from-so/${so.id}`, {
            invoiceNo: invoiceNoBase,
            invoiceDate: draft.orderDate,
          });
        } catch (invoiceError) {
          const fallbackNo = `${invoiceNoBase}-${Date.now()}`;
          await apiPost(`/invoices/from-so/${so.id}`, {
            invoiceNo: fallbackNo,
            invoiceDate: draft.orderDate,
          });
        }
      }
      await loadOrders();
      setDialogOpen(false);
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to create sales order";
      setError(message);
      console.error("Failed to create sales order:", createError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Sales Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage sales orders and fulfillment
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New SO
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={salesOrdersData} />

      {dialogOpen && (
        <SalesOrderDialog
          customers={customers}
          products={products}
          costCenters={costCenters}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateSalesOrder}
          isSaving={isSaving}
        />
      )}
    </AppLayout>
  );
}

function SalesOrderDialog({
  customers,
  products,
  costCenters,
  onClose,
  onSubmit,
  isSaving,
}: {
  customers: BackendContact[];
  products: BackendProduct[];
  costCenters: CostCenter[];
  onClose: () => void;
  onSubmit: (draft: SalesOrderDraft) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<SalesOrderDraft>({
    customerId: "",
    soNo: "",
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: "",
    status: "draft",
    currency: "INR",
    notes: "",
    lines: [
      {
        productId: "",
        qty: 1,
        unitPrice: products[0]?.salePrice ?? 0,
        taxRate: 0,
        analyticAccountId: "",
        description: "",
      },
    ],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const defaultProductId = products[0]?.id ?? "";
  const defaultProductPrice = products[0]?.salePrice ?? 0;

  useEffect(() => {
    if (!form.customerId && customers.length > 0) {
      setForm((prev) => ({ ...prev, customerId: customers[0].id }));
    }
  }, [customers, form.customerId]);

  useEffect(() => {
    if (!defaultProductId) return;
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.productId
          ? line
          : {
              ...line,
              productId: defaultProductId,
              unitPrice: defaultProductPrice,
            },
      ),
    }));
  }, [defaultProductId, defaultProductPrice]);

  const handleChange = (field: keyof SalesOrderDraft, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (index: number, field: keyof LineDraft, value: string | number) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], [field]: value };
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          productId: products[0]?.id ?? "",
          qty: 1,
          unitPrice: products[0]?.salePrice ?? 0,
          taxRate: 0,
          analyticAccountId: "",
          description: "",
        },
      ],
    }));
  };

  const removeLine = (index: number) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, idx) => idx !== index),
    }));
  };

  const lineTotals = useMemo(
    () =>
      form.lines.map((line) => {
        const qty = Number(line.qty) || 0;
        const unit = Number(line.unitPrice) || 0;
        const tax = Number(line.taxRate) || 0;
        return qty * unit * (1 + tax / 100);
      }),
    [form.lines],
  );

  const orderTotal = useMemo(
    () => lineTotals.reduce((sum, value) => sum + value, 0),
    [lineTotals],
  );

  const validate = () => {
    if (!form.customerId) return "Select a customer.";
    if (!form.soNo.trim()) return "SO number is required.";
    if (!form.orderDate) return "Order date is required.";
    if (!form.lines.length) return "Add at least one line.";
    for (const [index, line] of form.lines.entries()) {
      if (!line.productId) return `Select a product on line ${index + 1}.`;
      if (!line.qty || Number(line.qty) <= 0) return `Qty must be > 0 on line ${index + 1}.`;
      if (Number(line.unitPrice) < 0) return `Unit price must be >= 0 on line ${index + 1}.`;
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setFormError(message);
      return;
    }
    setFormError(null);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[36px] border border-brand-primary/30 bg-white p-8 text-brand-dark shadow-[0_25px_120px_rgba(15,23,42,0.18)] dark:border-brand-primary/40 dark:bg-slate-900 dark:text-brand-light">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">Create Sales Order</h2>
          <button onClick={onClose} className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Customer">
              <select
                required
                value={form.customerId}
                onChange={(e) => handleChange("customerId", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-primary focus:outline-none dark:text-brand-light dark:placeholder:text-brand-light/40"
              >
                <option value="" disabled className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">
                  {customers.length ? "Select customer" : "No customers found"}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">
                    {c.displayName}{c.isPortalUser ? " (Portal)" : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="SO Number">
              <input
                required
                value={form.soNo}
                onChange={(e) => handleChange("soNo", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-primary focus:outline-none dark:text-brand-light dark:placeholder:text-brand-light/40"
              />
            </FormField>
            <FormField label="Order Date">
              <input
                required
                type="date"
                value={form.orderDate}
                onChange={(e) => handleChange("orderDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
              />
            </FormField>
            <FormField label="Delivery Date">
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => handleChange("deliveryDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as SalesOrderDraft["status"])}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
              >
                <option value="draft" className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">Draft</option>
                <option value="confirmed" className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">Confirmed</option>
                <option value="done" className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">Done</option>
                <option value="cancelled" className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">Cancelled</option>
              </select>
            </FormField>
            <FormField label="Currency">
              <input
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-primary focus:outline-none dark:text-brand-light dark:placeholder:text-brand-light/40"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full rounded-2xl border border-brand-primary/30 bg-transparent px-3 py-2 text-sm text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-primary focus:outline-none dark:text-brand-light dark:placeholder:text-brand-light/40"
              rows={2}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70 dark:text-brand-light/70">
                Lines
              </h3>
              <button type="button" onClick={addLine} className="btn-secondary">
                Add Line
              </button>
            </div>
            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                {formError}
              </div>
            )}
            {form.lines.map((line, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-brand-primary/20 p-4 md:grid-cols-6">
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Product</label>
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => handleLineChange(index, "productId", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  >
                    <option value="" disabled className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">
                      {products.length ? "Select product" : "No products found"}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) => handleLineChange(index, "qty", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Unit Price</label>
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Tax %</label>
                  <input
                    type="number"
                    min={0}
                    value={line.taxRate}
                    onChange={(e) => handleLineChange(index, "taxRate", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Cost Center</label>
                  <select
                    value={line.analyticAccountId}
                    onChange={(e) => handleLineChange(index, "analyticAccountId", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  >
                    <option value="" className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">Auto</option>
                    {costCenters.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white text-brand-dark dark:bg-slate-900 dark:text-brand-light">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">Description</label>
                  <input
                    value={line.description}
                    onChange={(e) => handleLineChange(index, "description", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-brand-dark focus:border-brand-primary focus:outline-none dark:text-brand-light"
                  />
                </div>
                <div className="md:col-span-6 text-right text-xs uppercase tracking-widest text-brand-dark/60 dark:text-brand-light/60">
                  Line total: {lineTotals[index].toFixed(2)} {form.currency || "INR"}
                </div>
                {form.lines.length > 1 && (
                  <div className="md:col-span-6 text-right">
                    <button type="button" onClick={() => removeLine(index)} className="text-xs text-red-600">
                      Remove line
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-brand-primary/20 px-4 py-3 text-sm font-semibold">
            <span>Order Total</span>
            <span>{orderTotal.toFixed(2)} {form.currency || "INR"}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-light/70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/70 dark:text-brand-light/70">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

