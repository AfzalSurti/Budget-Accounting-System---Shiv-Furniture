"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PortalPaymentRow {
  id: string;
  recordId?: string;
  description: string;
  amount: string;
  date: string;
  method: string;
  status: StatusType;
  statusLabel?: string;
}

export default function PortalPaymentsPage() {
  const [paymentsData, setPaymentsData] = useState<PortalPaymentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PortalPaymentRow[]>(
          "/portal/payments?view=table",
        );
        setPaymentsData(data ?? []);
      } catch (error) {
        console.error("Failed to load portal payments:", error);
      }
    };

    load();
  }, []);

  const columns = [
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
    },
    {
      key: "id" as const,
      label: "Payment #",
    },
    {
      key: "description" as const,
      label: "Description",
    },
    {
      key: "amount" as const,
      label: "Amount",
      className: "font-mono font-bold",
    },
    {
      key: "method" as const,
      label: "Method",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string, row: PortalPaymentRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading mb-2">Payment History</h1>
        <p className="text-slate-600 dark:text-slate-400">
          View all your payments
        </p>
      </div>

      <DataTable columns={columns} data={paymentsData} />
    </div>
  );
}
