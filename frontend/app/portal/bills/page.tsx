"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiGet } from "@/lib/api";
import { Download, Eye } from "lucide-react";
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
