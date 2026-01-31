"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const portalInvoicesData = [
  {
    id: "INV-PORTAL-0142",
    amount: "$12,500.00",
    dueDate: "2026-02-15",
    status: "pending" as const,
    issueDate: "2026-01-28",
  },
  {
    id: "INV-PORTAL-0141",
    amount: "$8,750.00",
    dueDate: "2026-02-10",
    status: "completed" as const,
    issueDate: "2026-01-27",
  },
  {
    id: "INV-PORTAL-0140",
    amount: "$15,200.00",
    dueDate: "2026-02-20",
    status: "pending" as const,
    issueDate: "2026-01-25",
  },
];

export default function PortalInvoicesPage() {
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
      <div className="mb-8">
        <h1 className="section-heading mb-2">My Invoices</h1>
        <p className="text-slate-600 dark:text-slate-400">Download and view your invoices</p>
      </div>

      <DataTable columns={columns} data={portalInvoicesData} />
    </AppLayout>
  );
}
