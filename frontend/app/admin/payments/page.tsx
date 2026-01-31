"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const paymentsData = [
  {
    id: "PAY-2026-001",
    description: "Invoice INV-2026-0142 Payment",
    amount: "₹12,500.00",
    date: "2026-01-28",
    method: "Bank Transfer",
    status: "completed" as const,
  },
  {
    id: "PAY-2026-002",
    description: "Vendor Payment - Raw Materials Co.",
    amount: "₹25,400.00",
    date: "2026-01-25",
    method: "ACH",
    status: "completed" as const,
  },
  {
    id: "PAY-2026-003",
    description: "Refund - Client ABC",
    amount: "₹3,200.00",
    date: "2026-01-22",
    method: "Credit Card",
    status: "pending" as const,
  },
];

export default function PaymentsPage() {
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
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage all incoming and outgoing payments</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New Payment
        </button>
      </div>

      <DataTable columns={columns} data={paymentsData} />  );
}
