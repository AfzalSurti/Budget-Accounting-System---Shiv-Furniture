"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const invoicesData = [
  {
    id: "INV-2026-0142",
    customer: "ABC Manufacturing Co.",
    amount: "₹12,500.00",
    dueDate: "2026-02-15",
    status: "pending" as const,
    issueDate: "2026-01-28",
  },
  {
    id: "INV-2026-0141",
    customer: "XYZ Ltd.",
    amount: "₹8,750.00",
    dueDate: "2026-02-10",
    status: "completed" as const,
    issueDate: "2026-01-27",
  },
  {
    id: "INV-2026-0140",
    customer: "Global Traders Inc.",
    amount: "₹15,200.00",
    dueDate: "2026-02-20",
    status: "pending" as const,
    issueDate: "2026-01-25",
  },
  {
    id: "INV-2026-0139",
    customer: "Premium Retail Group",
    amount: "₹22,300.00",
    dueDate: "2026-02-05",
    status: "completed" as const,
    issueDate: "2026-01-23",
  },
];

export default function CustomerInvoicesPage() {
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
      key: "dueDate" as const,
      label: "Due Date",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Customer Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track customer invoices</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      <DataTable columns={columns} data={invoicesData} />
    </AppLayout>
  );
}
