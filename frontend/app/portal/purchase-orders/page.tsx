"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const poData = [
  {
    id: "PO-2026-001",
    vendor: "Equipment Supplier",
    amount: "₹25,000.00",
    deliveryDate: "2026-02-15",
    status: "completed" as const,
    issueDate: "2026-01-10",
  },
  {
    id: "PO-2026-002",
    vendor: "Raw Materials Co.",
    amount: "₹18,500.00",
    deliveryDate: "2026-02-20",
    status: "active" as const,
    issueDate: "2026-01-20",
  },
  {
    id: "PO-2026-003",
    vendor: "Office Supplies Ltd.",
    amount: "₹3,200.00",
    deliveryDate: "2026-02-10",
    status: "pending" as const,
    issueDate: "2026-01-25",
  },
];

export default function PortalPurchaseOrdersPage() {
  const columns = [
    {
      key: "issueDate" as const,
      label: "Date",
      sortable: true,
    },
    {
      key: "id" as const,
      label: "PO #",
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
      key: "deliveryDate" as const,
      label: "Delivery Date",
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
        <h1 className="section-heading mb-2">Purchase Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your purchase orders</p>
      </div>

      <DataTable columns={columns} data={poData} />
    </div>
  );
}
