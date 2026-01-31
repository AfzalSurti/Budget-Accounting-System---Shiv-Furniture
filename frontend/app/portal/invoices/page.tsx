"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiDownload, apiGet, apiPost } from "@/lib/api";
import { useEffect, useState } from "react";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { Download } from "lucide-react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PortalInvoiceRow {
  id: string;
  recordId?: string;
  totalAmount?: number;
  paidAmount?: number;
  paymentState?: string;
  amount: string;
  dueDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
}

export default function PortalInvoicesPage() {
  const [portalInvoicesData, setPortalInvoicesData] = useState<
    PortalInvoiceRow[]
  >([]);
  const [payTarget, setPayTarget] = useState<PortalInvoiceRow | null>(null);
  const [payAmount, setPayAmount] = useState("0");
  const [payMethod, setPayMethod] = useState("bank");
  const [payReference, setPayReference] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PortalInvoiceRow[]>(
          "/portal/invoices?view=table",
        );
        setPortalInvoicesData(data ?? []);
      } catch (error) {
        console.error("Failed to load portal invoices:", error);
      }
    };

    load();
  }, []);

  const remainingFor = (row: PortalInvoiceRow) => {
    const total = row.totalAmount ?? 0;
    const paid = row.paidAmount ?? 0;
    return Math.max(0, total - paid);
  };

  const handleDownloadPdf = async (row: PortalInvoiceRow) => {
    if (!row.recordId) return;
    try {
      await apiDownload(`/portal/invoices/${row.recordId}/pdf`, `${row.id}.pdf`);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error ? downloadError.message : "Failed to download PDF";
      setError(message);
    }
  };

  const openPayment = (row: PortalInvoiceRow) => {
    const remaining = remainingFor(row);
    setPayAmount(remaining.toFixed(2));
    setPayMethod("bank");
    setPayReference("");
    setPayTarget(row);
  };

  const submitPayment = async () => {
    if (!payTarget?.recordId) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await apiPost("/portal/payments", {
        companyId: DEFAULT_COMPANY_ID,
        paymentDate: new Date().toISOString().slice(0, 10),
        method: payMethod,
        reference: payReference || null,
        amount,
        allocations: [
          {
            targetType: "customer_invoice",
            targetId: payTarget.recordId,
            amount,
          },
        ],
      });
      setPayTarget(null);
      const data = await apiGet<PortalInvoiceRow[]>(
        "/portal/invoices?view=table",
      );
      setPortalInvoicesData(data ?? []);
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to create payment";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Date", key: "issueDate" },
      { header: "Invoice #", key: "id" },
      { header: "Amount", key: "amount" },
      { header: "Due Date", key: "dueDate" },
      { header: "Status", key: "status" },
    ];

    const processedData = portalInvoicesData.map((row) => ({
      ...row,
      status: row.statusLabel || row.status,
    }));

    exportTableToPDF("My Invoices", columns, processedData, "My_Invoices.pdf");
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
      key: "amount" as const,
      label: "Amount",
      className: "font-mono font-bold",
    },
    {
      key: "recordId" as const,
      label: "Paid %",
      render: (_value: string | undefined, row: PortalInvoiceRow) => {
        const total = row.totalAmount ?? 0;
        const paid = row.paidAmount ?? 0;
        const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
        return <span className="text-xs font-semibold">{pct.toFixed(1)}%</span>;
      },
    },
    {
      key: "recordId" as const,
      label: "Remaining",
      render: (_value: string | undefined, row: PortalInvoiceRow) => {
        const remaining = remainingFor(row);
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
      render: (value: string, row: PortalInvoiceRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
    {
      key: "recordId" as const,
      label: "Actions",
      render: (_value: string | undefined, row: PortalInvoiceRow) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openPayment(row)}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            Pay
          </button>
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-heading mb-2">My Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Download and view your invoices
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export as PDF
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={portalInvoicesData} />

      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-brand-primary/30 bg-white p-6 text-brand-dark shadow-xl dark:border-brand-primary/40 dark:bg-slate-900 dark:text-brand-light">
            <div className="flex items-center justify-between border-b border-brand-primary/20 pb-3">
              <h2 className="text-lg font-semibold">Pay Invoice {payTarget.id}</h2>
              <button onClick={() => setPayTarget(null)} className="rounded-full border border-brand-primary/40 px-2 py-1 text-xs">
                X
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/70">
                Amount
                <input
                  type="number"
                  min={0}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/70">
                Method
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/70">
                Reference
                <input
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="mt-1 w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={submitPayment}
                disabled={isSaving}
                className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/20 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Processing..." : "Pay"}
              </button>
              <button
                onClick={() => setPayTarget(null)}
                disabled={isSaving}
                className="flex-1 rounded-full border border-brand-primary/40 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
