"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet } from "@/lib/api";
import { Plus, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportTableToPDF } from "@/lib/pdf-utils";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface VendorBillRow {
  id: string;
  recordId?: string;
  vendor: string;
  date: string;
  amount: string;
  status: StatusType;
  statusLabel?: string;
  dueDate: string;
}

export default function VendorBillsPage() {
  const [vendorBillsData, setVendorBillsData] = useState<VendorBillRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<VendorBillRow[]>(
          `/vendor-bills?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setVendorBillsData(data ?? []);
      } catch (error) {
        console.error("Failed to load vendor bills:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    exportTableToPDF(
      "Vendor Bills",
      [
        { header: "Date", key: "date" },
        { header: "Bill #", key: "id" },
        { header: "Vendor", key: "vendor" },
        { header: "Amount", key: "amount" },
        { header: "Due Date", key: "dueDate" },
        { header: "Status", key: "statusLabel" },
      ],
      vendorBillsData.map(row => ({
        ...row,
        statusLabel: row.statusLabel || row.status
      })),
      "Vendor_Bills.pdf"
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
      render: (value: string, row: VendorBillRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Vendor Bills</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and manage vendor invoices
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Bill
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={vendorBillsData} />
    </AppLayout>
  );
}
