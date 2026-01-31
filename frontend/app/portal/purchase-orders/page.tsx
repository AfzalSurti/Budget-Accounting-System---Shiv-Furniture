"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PortalPurchaseOrderRow {
  id: string;
  recordId?: string;
  vendor: string;
  amount: string;
  deliveryDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
}

export default function PortalPurchaseOrdersPage() {
  const [poData, setPoData] = useState<PortalPurchaseOrderRow[]>([]);
  const { user, isCustomer } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCustomer()) {
      setError("Portal access is available for signed-in customers only.");
      return;
    }
    if (!user?.contactId) {
      setError("Portal account is not linked to a contact.");
      return;
    }
    const load = async () => {
      try {
        const data = await apiGet<PortalPurchaseOrderRow[]>(
          "/portal/purchase-orders?view=table",
        );
        setPoData(data ?? []);
      } catch (error) {
        console.error("Failed to load portal purchase orders:", error);
        setError("Failed to load portal purchase orders.");
      }
    };

    load();
  }, [user, isCustomer]);

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
      render: (value: string, row: PortalPurchaseOrderRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading mb-2">Purchase Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your purchase orders
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={poData} />
    </div>
  );
}
