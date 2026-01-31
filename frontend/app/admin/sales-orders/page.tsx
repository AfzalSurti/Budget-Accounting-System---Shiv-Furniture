"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const salesOrdersData = [
  {
    id: "SO-2026-001",
    customer: "ABC Manufacturing Co.",
    date: "2026-01-28",
    amount: "₹35,600.00",
    status: "active" as const,
    deliveryDate: "2026-02-10",
  },
  {
    id: "SO-2026-002",
    customer: "Global Trading LLC",
    date: "2026-01-25",
    amount: "₹22,400.00",
    status: "completed" as const,
    deliveryDate: "2026-01-28",
  },
  {
    id: "SO-2026-003",
    customer: "Premium Retail Group",
    date: "2026-01-20",
    amount: "₹48,900.00",
    status: "active" as const,
    deliveryDate: "2026-02-15",
  },
];

export default function SalesOrdersPage() {
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
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Sales Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage sales orders and fulfillment</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New SO
        </button>
      </div>

      <DataTable columns={columns} data={salesOrdersData} />  );
}
