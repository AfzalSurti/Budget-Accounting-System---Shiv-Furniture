"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet } from "@/lib/api";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PaymentRow {
  id: string;
  recordId?: string;
  description: string;
  amount: string;
  date: string;
  method: string;
  status: StatusType;
  statusLabel?: string;
}

export default function PaymentsPage() {
  const [paymentsData, setPaymentsData] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PaymentRow[]>(
          `/payments?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setPaymentsData(data ?? []);
      } catch (error) {
        console.error("Failed to load payments:", error);
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
      render: (value: string, row: PaymentRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all incoming and outgoing payments
          </p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New Payment
        </button>
      </div>

      <DataTable columns={columns} data={paymentsData} />
    </AppLayout>
  );
}
