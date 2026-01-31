"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const paymentsData = [
  {
    id: "PAY-2026-001",
    description: "Invoice INV-PORTAL-0141 Payment",
    amount: "₹8,750.00",
    date: "2026-01-27",
    method: "Bank Transfer",
    status: "completed" as const,
  },
  {
    id: "PAY-2026-002",
    description: "Vendor Payment - ABC Corp",
    amount: "₹5,500.00",
    date: "2026-01-26",
    method: "Credit Card",
    status: "completed" as const,
  },
  {
    id: "PAY-2026-003",
    description: "Invoice INV-PORTAL-0140 Payment",
    amount: "₹15,200.00",
    date: "2026-01-25",
    method: "ACH",
    status: "pending" as const,
  },
];

export default function PortalPaymentsPage() {
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading mb-2">Payment History</h1>
        <p className="text-slate-600 dark:text-slate-400">View all your payments</p>
      </div>

      <DataTable columns={columns} data={paymentsData} />
    </div>
  );
}
