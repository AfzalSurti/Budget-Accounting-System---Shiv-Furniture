"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiDownload, apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PortalBillRow {
  id: string;
  recordId?: string;
  vendor: string;
  totalAmount?: number;
  paidAmount?: number;
  paymentState?: string;
  amount: string;
  dueDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
}

export default function PortalBillsPage() {
  const [vendorInvoicesData, setVendorInvoicesData] = useState<PortalBillRow[]>(
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PortalBillRow[]>("/portal/bills?view=table");
        setVendorInvoicesData(data ?? []);
      } catch (error) {
        console.error("Failed to load portal bills:", error);
      }
    };

    load();
  }, []);

  const remainingFor = (row: PortalBillRow) => {
    const total = row.totalAmount ?? 0;
    const paid = row.paidAmount ?? 0;
    return Math.max(0, total - paid);
  };

  const handleDownloadPdf = async (row: PortalBillRow) => {
    if (!row.recordId) return;
    try {
      await apiDownload(`/portal/bills/${row.recordId}/pdf`, `${row.id}.pdf`);
    } catch (downloadError) {
      console.error("Failed to download PDF:", downloadError);
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
      label: "Bill #",
      sortable: true,
    },
    {
      key: "vendor" as const,
      label: "Vendor",
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
      render: (_value: string | undefined, row: PortalBillRow) => {
        const total = row.totalAmount ?? 0;
        const paid = row.paidAmount ?? 0;
        const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
        return <span className="text-xs font-semibold">{pct.toFixed(1)}%</span>;
      },
    },
    {
      key: "recordId" as const,
      label: "Remaining",
      render: (_value: string | undefined, row: PortalBillRow) => {
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
      render: (value: string, row: PortalBillRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
    {
      key: "recordId" as const,
      label: "Actions",
      render: (_value: string | undefined, row: PortalBillRow) => (
        <button
          onClick={() => handleDownloadPdf(row)}
          className="text-xs font-semibold text-slate-600 hover:underline"
        >
          PDF
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading mb-2">My Bills (Vendor Invoices)</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track and pay your vendor bills
        </p>
      </div>

      <DataTable columns={columns} data={vendorInvoicesData} />
    </div>
  );
}
