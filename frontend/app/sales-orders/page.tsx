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

interface SalesOrderRow {
  id: string;
  recordId?: string;
  customer: string;
  date: string;
  amount: string;
  status: StatusType;
  statusLabel?: string;
  deliveryDate: string;
}

export default function SalesOrdersPage() {
  const [salesOrdersData, setSalesOrdersData] = useState<SalesOrderRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<SalesOrderRow[]>(
          `/sales-orders?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setSalesOrdersData(data ?? []);
      } catch (error) {
        console.error("Failed to load sales orders:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    const columnMapping = {
      date: "Date",
      id: "SO #",
      customer: "Customer",
      amount: "Amount",
      deliveryDate: "Delivery Date",
      status: "Status",
    };

    const processedData = salesOrdersData.map((row) => ({
      ...row,
      status: row.statusLabel ?? row.status,
    }));

    exportTableToPDF(
      processedData,
      columnMapping,
      "Sales Orders",
      "sales-orders",
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
      render: (value: string, row: SalesOrderRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Sales Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage sales orders and fulfillment
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
            New SO
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={salesOrdersData} />
    </AppLayout>
  );
}
