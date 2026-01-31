"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiDownload, apiGet, apiPost, apiPut } from "@/lib/api";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { Download, Plus } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PurchaseOrderRow {
  id: string;
  recordId?: string;
  rawStatus?: "draft" | "confirmed" | "cancelled" | "done";
  vendor: string;
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
  costPrice?: number;
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
  analyticAccountMode: "auto" | "manual";
  description: string;
}

interface PurchaseOrderDraft {
  vendorId: string;
  poNo: string;
  orderDate: string;
  deliveryDate: string;
  status: "draft" | "confirmed" | "cancelled" | "done";
  currency: string;
  notes: string;
  lines: LineDraft[];
}

export default function PurchaseOrdersPage() {
  const [poData, setPoData] = useState<PurchaseOrderRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<BackendContact[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vendors = useMemo(
    () =>
      contacts.filter(
        (row) => row.contactType === "vendor" || row.contactType === "both",
      ),
    [contacts],
  );

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiGet<PurchaseOrderRow[]>(
        `/purchase-orders?companyId=${DEFAULT_COMPANY_ID}&view=table`,
      );
      setPoData(data ?? []);
    } catch (loadError) {
      console.error("Failed to load purchase orders:", loadError);
    }
  }, []);

  const loadLookups = useCallback(async () => {
    try {
      const [contactsData, productsData, centersData] = await Promise.all([
        apiGet<BackendContact[]>(`/contacts?companyId=${DEFAULT_COMPANY_ID}`),
        apiGet<BackendProduct[]>(`/products?companyId=${DEFAULT_COMPANY_ID}`),
        apiGet<CostCenter[]>(
          `/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`,
        ),
      ]);
      setContacts(contactsData ?? []);
      setProducts(productsData ?? []);
      setCostCenters(centersData ?? []);
    } catch (loadError) {
      console.error("Failed to load purchase order lookups:", loadError);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadLookups();
  }, [loadOrders, loadLookups]);

  const handleExportPDF = () => {
    const columns = [
      { header: "Date", key: "date" },
      { header: "PO #", key: "id" },
      { header: "Vendor", key: "vendor" },
      { header: "Amount", key: "amount" },
      { header: "Delivery Date", key: "deliveryDate" },
      { header: "Status", key: "status" },
    ];

    const processedData = poData.map((row) => ({
      ...row,
      status: row.statusLabel ?? row.status,
    }));

    exportTableToPDF(
      "Purchase Orders",
      columns,
      processedData,
      "purchase-orders.pdf",
    );
  };

  const resolveAutoCostCenter = async (
    vendorId: string,
    productId: string,
  ): Promise<{
    analyticAccountId: string;
    analyticAccountName: string;
  } | null> => {
    try {
      const response = await apiPost<{
        analyticAccountId: string;
        analyticAccountName: string;
        mode: string;
      }>("/purchase-orders/resolve-cost-center", {
        companyId: DEFAULT_COMPANY_ID,
        vendorId,
        productId,
      });
      console.log("Auto cost center resolved:", response);
      return response;
    } catch (err) {
      console.error("Failed to resolve auto cost center:", err);
      return null;
    }
  };

  const handleCreatePurchaseOrder = async (draft: PurchaseOrderDraft) => {
    setIsSaving(true);
    setError(null);
    try {
      const linesWithCostCenters = await Promise.all(
        draft.lines.map(async (line) => {
          let finalAnalyticAccountId = line.analyticAccountId;
          const mode = line.analyticAccountMode;

          if (mode === "auto" && line.productId) {
            const resolved = await resolveAutoCostCenter(
              draft.vendorId,
              line.productId,
            );
            if (resolved) {
              finalAnalyticAccountId = resolved.analyticAccountId;
            }
          }

          const product = products.find((p) => p.id === line.productId);
          const costCenter = costCenters.find(
            (c) => c.id === finalAnalyticAccountId,
          );

          return {
            ...line,
            finalAnalyticAccountId,
            productName: product?.name,
            costCenterName: costCenter?.name,
            mode,
          };
        }),
      );

      console.log("=== Purchase Order Lines ===");
      console.table(
        linesWithCostCenters.map((line, idx) => ({
          line: idx + 1,
          mode: line.mode,
          analyticAccountId: line.finalAnalyticAccountId,
          analyticAccountName: line.costCenterName || "N/A",
          productId: line.productId,
          productName: line.productName || "N/A",
        })),
      );

      await apiPost("/purchase-orders", {
        companyId: DEFAULT_COMPANY_ID,
        vendorId: draft.vendorId,
        poNo: draft.poNo,
        orderDate: draft.orderDate,
        deliveryDate: draft.deliveryDate ? draft.deliveryDate : null,
        status: draft.status,
        currency: draft.currency || "INR",
        notes: draft.notes ? draft.notes : null,
        lines: linesWithCostCenters.map((line) => ({
          productId: line.productId,
          analyticAccountId: line.finalAnalyticAccountId || null,
          description: line.description || null,
          qty: Number(line.qty),
          unitPrice: Number(line.unitPrice),
          taxRate: Number(line.taxRate) || 0,
        })),
      });
      await loadOrders();
      setDialogOpen(false);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create purchase order";
      setError(message);
      console.error("Failed to create purchase order:", createError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (
    row: PurchaseOrderRow,
    status: "confirmed" | "done",
  ) => {
    if (!row.recordId) return;
    try {
      await apiPut(`/purchase-orders/${row.recordId}`, { status });
      await loadOrders();
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update status";
      setError(message);
    }
  };

  const handleGenerateBill = async (row: PurchaseOrderRow) => {
    if (!row.recordId) return;
    const billNo = window.prompt("Enter Vendor Bill Number");
    if (!billNo) return;
    const billDate =
      window.prompt(
        "Bill Date (YYYY-MM-DD)",
        new Date().toISOString().slice(0, 10),
      ) ?? "";
    if (!billDate) return;
    try {
      await apiPost(`/vendor-bills/from-po/${row.recordId}`, {
        billNo,
        billDate,
      });
      await loadOrders();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to generate vendor bill";
      setError(message);
    }
  };

  const handleDownloadPdf = async (row: PurchaseOrderRow) => {
    if (!row.recordId) return;
    try {
      await apiDownload(`/po/${row.recordId}/pdf`, `${row.id}.pdf`);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "Failed to download PDF";
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
      label: "PO #",
      sortable: true,
    },
    {
      key: "vendor" as const,
      label: "Vendor",
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
      render: (value: string, row: PurchaseOrderRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
    {
      key: "recordId" as const,
      label: "Actions",
      render: (_value: string | undefined, row: PurchaseOrderRow) => (
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
              onClick={() => handleGenerateBill(row)}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Create Bill
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
          <h1 className="section-heading mb-2">Purchase Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage purchase orders
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
            New PO
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={poData} />

      {dialogOpen && (
        <PurchaseOrderDialog
          vendors={vendors}
          products={products}
          costCenters={costCenters}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreatePurchaseOrder}
          isSaving={isSaving}
        />
      )}
    </AppLayout>
  );
}

function PurchaseOrderDialog({
  vendors,
  products,
  costCenters,
  onClose,
  onSubmit,
  isSaving,
}: {
  vendors: BackendContact[];
  products: BackendProduct[];
  costCenters: CostCenter[];
  onClose: () => void;
  onSubmit: (draft: PurchaseOrderDraft) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<PurchaseOrderDraft>({
    vendorId: "",
    poNo: "",
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: "",
    status: "draft",
    currency: "INR",
    notes: "",
    lines: [
      {
        productId: products[0]?.id ?? "",
        qty: 1,
        unitPrice: products[0]?.costPrice ?? 0,
        taxRate: 0,
        analyticAccountId: "",
        analyticAccountMode: "auto",
        description: "",
      },
    ],
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: keyof PurchaseOrderDraft, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (
    index: number,
    field: keyof LineDraft,
    value: string | number,
  ) => {
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
          unitPrice: products[0]?.costPrice ?? 0,
          taxRate: 0,
          analyticAccountId: "",
          analyticAccountMode: "auto",
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
    if (!form.vendorId) return "Select a vendor.";
    if (!form.poNo.trim()) return "PO number is required.";
    if (!form.orderDate) return "Order date is required.";
    if (!form.lines.length) return "Add at least one line.";
    for (const [index, line] of form.lines.entries()) {
      if (!line.productId) return `Select a product on line ${index + 1}.`;
      if (!line.qty || Number(line.qty) <= 0)
        return `Qty must be > 0 on line ${index + 1}.`;
      if (Number(line.unitPrice) < 0)
        return `Unit price must be >= 0 on line ${index + 1}.`;
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
          <h2 className="text-2xl font-semibold">Create Purchase Order</h2>
          <button
            onClick={onClose}
            className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10"
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Vendor">
              <select
                required
                value={form.vendorId}
                onChange={(e) => handleChange("vendorId", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.displayName}
                    {v.isPortalUser ? " (Portal)" : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="PO Number">
              <input
                required
                value={form.poNo}
                onChange={(e) => handleChange("poNo", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Order Date">
              <input
                required
                type="date"
                value={form.orderDate}
                onChange={(e) => handleChange("orderDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Delivery Date">
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => handleChange("deliveryDate", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value as PurchaseOrderDraft["status"],
                  )
                }
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="done">Done</option>
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

          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full rounded-2xl border border-brand-primary/30 bg-transparent px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              rows={2}
            />
          </FormField>

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
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-brand-primary/20 p-4 md:grid-cols-6"
              >
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Product
                  </label>
                  <select
                    required
                    value={line.productId}
                    onChange={(e) =>
                      handleLineChange(index, "productId", e.target.value)
                    }
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
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) =>
                      handleLineChange(index, "qty", Number(e.target.value))
                    }
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice}
                    onChange={(e) =>
                      handleLineChange(
                        index,
                        "unitPrice",
                        Number(e.target.value),
                      )
                    }
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Tax %
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={line.taxRate}
                    onChange={(e) =>
                      handleLineChange(index, "taxRate", Number(e.target.value))
                    }
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Cost Center
                  </label>
                  <select
                    value={line.analyticAccountId}
                    onChange={(e) => {
                      const value = e.target.value;
                      const mode = value === "" ? "auto" : "manual";
                      console.log(`Cost center selected: ${mode}`);
                      handleLineChange(index, "analyticAccountId", value);
                      handleLineChange(index, "analyticAccountMode", mode);
                    }}
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  >
                    <option value="">Auto</option>
                    {costCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {line.analyticAccountMode === "auto" && (
                    <div className="mt-1 text-[10px] text-brand-dark/50">
                      Will be auto-assigned based on product & vendor
                    </div>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="text-xs uppercase tracking-widest text-brand-dark/60">
                    Description
                  </label>
                  <input
                    value={line.description}
                    onChange={(e) =>
                      handleLineChange(index, "description", e.target.value)
                    }
                    className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="md:col-span-6 text-right text-xs uppercase tracking-widest text-brand-dark/60">
                  Line total: {lineTotals[index].toFixed(2)}{" "}
                  {form.currency || "INR"}
                </div>
                {form.lines.length > 1 && (
                  <div className="md:col-span-6 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-xs text-red-600"
                    >
                      Remove line
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-brand-primary/20 px-4 py-3 text-sm font-semibold">
            <span>Order Total</span>
            <span>
              {orderTotal.toFixed(2)} {form.currency || "INR"}
            </span>
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

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/70">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
