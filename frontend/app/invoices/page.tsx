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

interface InvoiceRow {
  id: string;
  recordId?: string;
  customer: string;
  amount: string;
  dueDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
}

export default function CustomerInvoicesPage() {
  const [invoicesData, setInvoicesData] = useState<InvoiceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<InvoiceRow[]>(
          `/invoices?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setInvoicesData(data ?? []);
      } catch (error) {
        console.error("Failed to load invoices:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    exportTableToPDF(
      "Customer Invoices",
      [
        { header: "Date", key: "issueDate" },
        { header: "Invoice #", key: "id" },
        { header: "Customer", key: "customer" },
        { header: "Amount", key: "amount" },
        { header: "Due Date", key: "dueDate" },
        { header: "Status", key: "statusLabel" },
      ],
      invoicesData.map(row => ({
        ...row,
        statusLabel: row.statusLabel || row.status
      })),
      "Customer_Invoices.pdf"
    );
  };

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
      render: (value: string, row: InvoiceRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Customer Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track customer invoices
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
            Create Invoice
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={invoicesData} />
    </AppLayout>
  );
}
