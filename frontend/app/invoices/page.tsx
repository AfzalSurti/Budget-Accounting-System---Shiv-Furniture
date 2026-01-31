"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiDownload, apiGet, apiPost, apiPut } from "@/lib/api";
import { Plus, Download } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { exportTableToPDF } from "@/lib/pdf-utils";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface InvoiceRow {
  id: string;
  recordId?: string;
  rawStatus?: "draft" | "posted" | "cancelled";
  paymentState?: string;
  totalAmount?: number;
  paidAmount?: number;
  paidPercent?: string;
  remainingAmount?: string;
  actions?: string;
  customer: string;
  amount: string;
  dueDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
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

interface InvoiceDraft {
  customerId: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  status: "draft" | "posted" | "cancelled";
  currency: string;
  lines: LineDraft[];
}

export default function CustomerInvoicesPage() {
  const [invoicesData, setInvoicesData] = useState<InvoiceRow[]>([]);
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

  const loadInvoices = useCallback(async () => {
    try {
      const data = await apiGet<InvoiceRow[]>(
        `/invoices?companyId=${DEFAULT_COMPANY_ID}&view=table`,
      );
      setInvoicesData(data ?? []);
    } catch (loadError) {
      console.error("Failed to load invoices:", loadError);
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
      console.error("Failed to load invoice lookups:", loadError);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
    loadLookups();
  }, [loadInvoices, loadLookups]);

  const handleExportPDF = () => {
    const columns = [
      { header: "Date", key: "issueDate" },
      { header: "Invoice #", key: "id" },
      { header: "Customer", key: "customer" },
      { header: "Amount", key: "amount" },
      { header: "Due Date", key: "dueDate" },
      { header: "Status", key: "status" },
    ];

    const processedData = invoicesData.map((row) => ({
      ...row,
      status: row.statusLabel || row.status,
    }));

    exportTableToPDF("Customer Invoices", columns, processedData, "Customer_Invoices.pdf");
  };

  const handlePostInvoice = async (row: InvoiceRow) => {
    if (!row.recordId) return;
    try {
      await apiPut(`/invoices/${row.recordId}`, { status: "posted" });
      await loadInvoices();
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "Failed to post invoice";
      setError(message);
    }
  };

  const handleDownloadPdf = async (row: InvoiceRow) => {
    if (!row.recordId) return;
    try {
      await apiDownload(`/invoices/${row.recordId}/pdf`, `${row.id}.pdf`);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error ? downloadError.message : "Failed to download PDF";
      setError(message);
    }
  };

  const handleCreateInvoice = async (draft: InvoiceDraft) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPost("/invoices", {
        companyId: DEFAULT_COMPANY_ID,
        customerId: draft.customerId,
        invoiceNo: draft.invoiceNo,
        invoiceDate: draft.invoiceDate,
        dueDate: draft.dueDate ? draft.dueDate : null,
        status: draft.status,
        currency: draft.currency || "INR",
        lines: draft.lines.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.analyticAccountId || null,
          description: line.description || null,
          qty: Number(line.qty),
          unitPrice: Number(line.unitPrice),
          taxRate: Number(line.taxRate) || 0,
        })),
      });
      await loadInvoices();
      setDialogOpen(false);
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to create invoice";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      key: "issueDate" as const,
      label: "Date",
      sortable: true,
    },
    {
      key: "id" as const,
      label: "Invoice #",
      sortable: true,
    },
    {
      key: "customer" as const,
      label: "Customer",
      sortable: true,
    },
    {
      key: "amount" as const,
      label: "Amount",
      className: "font-mono font-bold",
    },
    {
      key: "paidPercent" as const,
      label: "Paid %",
      render: (_value: string | undefined, row: InvoiceRow) => {
        const total = row.totalAmount ?? 0;
        const paid = row.paidAmount ?? 0;
        const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
        return <span className="text-xs font-semibold">{pct.toFixed(1)}%</span>;
      },
    },
    {
      key: "remainingAmount" as const,
      label: "Remaining",
      render: (_value: string | undefined, row: InvoiceRow) => {
        const total = row.totalAmount ?? 0;
        const paid = row.paidAmount ?? 0;
        const remaining = Math.max(0, total - paid);
        return <span className="text-xs font-semibold">INR {remaining.toFixed(2)}</span>;
      },
    },
    {
      key: "dueDate" as const,
      label: "Due Date",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string, row: InvoiceRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
    {
      key: "actions" as const,
      label: "Actions",
      render: (_value: string | undefined, row: InvoiceRow) => (
        <div className="flex flex-wrap gap-2">
          {row.rawStatus === "draft" && (
            <button
              onClick={() => handlePostInvoice(row)}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              Post
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
  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Customer Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track customer invoices
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={invoicesData} />

      {dialogOpen && (
        <InvoiceDialog
          customers={customers}
          products={products}
          costCenters={costCenters}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateInvoice}
          isSaving={isSaving}
        />
      )}
    </AppLayout>
  );
}

function InvoiceDialog({
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
  onSubmit: (draft: InvoiceDraft) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<InvoiceDraft>({
    customerId: customers[0]?.id ?? "",
    invoiceNo: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "draft",
    currency: "INR",
    lines: [
      {
        productId: products[0]?.id ?? "",
        qty: 1,
        unitPrice: products[0]?.salePrice ?? 0,
        taxRate: 0,
        analyticAccountId: "",
        description: "",
      },
    ],
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: keyof InvoiceDraft, value: string) => {
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
    if (!form.invoiceNo.trim()) return "Invoice number is required.";
    if (!form.invoiceDate) return "Invoice date is required.";
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
      <div className="w-full max-w-5xl rounded-[36px] border border-brand-primary/30 bg-white p-8 text-brand-dark shadow-[0_25px_120px_rgba(15,23,42,0.18)] dark:border-brand-primary/40 dark:bg-slate-900 dark:text-brand-light">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">Create Invoice</h2>
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
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}{c.isPortalUser ? " (Portal)" : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Invoice Number">
              <input
                required
                value={form.invoiceNo}
                onChange={(e) => handleChange("invoiceNo", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Invoice Date">
              <input
                required
                type="date"
                value={form.invoiceDate}
                onChange={(e) => handleChange("invoiceDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as InvoiceDraft["status"])}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
            <FormField label="Currency">
              <input
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">
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
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Product</label>
                  <select
                    required
                    value={line.productId}
                    onChange={(e) => handleLineChange(index, "productId", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) => handleLineChange(index, "qty", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Unit Price</label>
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Tax %</label>
                  <input
                    type="number"
                    min={0}
                    value={line.taxRate}
                    onChange={(e) => handleLineChange(index, "taxRate", Number(e.target.value))}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Cost Center</label>
                  <select
                    value={line.analyticAccountId}
                    onChange={(e) => handleLineChange(index, "analyticAccountId", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  >
                    <option value="">Auto</option>
                    {costCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">Description</label>
                  <input
                    value={line.description}
                    onChange={(e) => handleLineChange(index, "description", e.target.value)}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="md:col-span-6 text-right text-xs uppercase tracking-widest text-brand-dark/60">
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
            <span>Invoice Total</span>
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
              className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/70">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
