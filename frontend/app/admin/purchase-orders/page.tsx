"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";
import Link from "next/link";

const poData = [
  {
    id: "PO-2026-001",
    vendor: "Raw Materials Co.",
    date: "2026-01-28",
    amount: "₹45,200.00",
    status: "completed" as const,
    deliveryDate: "2026-02-05",
  },
  {
    id: "PO-2026-002",
    vendor: "Equipment Supplier",
    date: "2026-01-25",
    amount: "₹28,500.00",
    status: "active" as const,
    deliveryDate: "2026-02-15",
  },
  {
    id: "PO-2026-003",
    vendor: "Office Supplies Ltd.",
    date: "2026-01-20",
    amount: "₹12,300.00",
    status: "completed" as const,
    deliveryDate: "2026-01-28",
  },
];

export default function PurchaseOrdersPage() {
  const columns = [
    {
      key: "date" as const,
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
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Purchase Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage purchase orders
          </p>
        </div>
        <Link href="/purchase-orders" className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New PO
        </Link>
      </div>

      <DataTable columns={columns} data={poData} />
    </AppLayout>
  );
}
