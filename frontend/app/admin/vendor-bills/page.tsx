"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const vendorBillsData = [
  {
    id: "VB-2026-001",
    vendor: "Raw Materials Co.",
    date: "2026-01-28",
    amount: "₹25,400.00",
    status: "completed" as const,
    dueDate: "2026-02-15",
  },
  {
    id: "VB-2026-002",
    vendor: "Equipment Supplier",
    date: "2026-01-25",
    amount: "₹18,900.00",
    status: "pending" as const,
    dueDate: "2026-02-10",
  },
  {
    id: "VB-2026-003",
    vendor: "Utility Services Inc.",
    date: "2026-01-20",
    amount: "₹8,500.00",
    status: "completed" as const,
    dueDate: "2026-02-05",
  },
];

export default function VendorBillsPage() {
  const columns = [
    {
      key: "date" as const,
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
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Vendor Bills</h1>
          <p className="text-slate-600 dark:text-slate-400">Track and manage vendor invoices</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New Bill
        </button>
      </div>

      <DataTable columns={columns} data={vendorBillsData} />  );
}
