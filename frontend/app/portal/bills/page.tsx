"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Eye } from "lucide-react";

const vendorInvoicesData = [
  {
    id: "VB-2026-001",
    vendor: "Office Supplies Ltd.",
    amount: "₹3,250.00",
    dueDate: "2026-02-15",
    status: "pending" as const,
    issueDate: "2026-01-28",
  },
  {
    id: "VB-2026-002",
    vendor: "Equipment Rentals Co.",
    amount: "₹5,500.00",
    dueDate: "2026-02-10",
    status: "completed" as const,
    issueDate: "2026-01-27",
  },
  {
    id: "VB-2026-003",
    vendor: "Utility Services Inc.",
    amount: "₹8,200.00",
    dueDate: "2026-02-05",
    status: "pending" as const,
    issueDate: "2026-01-25",
  },
];

export default function PortalBillsPage() {
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
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading mb-2">My Bills (Vendor Invoices)</h1>
        <p className="text-slate-600 dark:text-slate-400">Track and pay your vendor bills</p>
      </div>

      <DataTable columns={columns} data={vendorInvoicesData} />
    </div>
  );
}
