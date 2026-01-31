"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet } from "@/lib/api";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PurchaseOrderRow {
  id: string;
  recordId?: string;
  vendor: string;
  date: string;
  amount: string;
  status: StatusType;
  statusLabel?: string;
  deliveryDate: string;
}

export default function PurchaseOrdersPage() {
  const [poData, setPoData] = useState<PurchaseOrderRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PurchaseOrderRow[]>(
          `/purchase-orders?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setPoData(data ?? []);
      } catch (error) {
        console.error("Failed to load purchase orders:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    const columnMapping = {
      date: "Date",
      id: "PO #",
      vendor: "Vendor",
      amount: "Amount",
      deliveryDate: "Delivery Date",
      status: "Status",
    };

    const processedData = poData.map((row) => ({
      ...row,
      status: row.statusLabel ?? row.status,
    }));

    exportTableToPDF(
      processedData,
      columnMapping,
      "Purchase Orders",
      "purchase-orders",
    );
  };

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
      render: (value: string, row: PurchaseOrderRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
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
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New PO
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={poData} />
    </AppLayout>
  );
}
