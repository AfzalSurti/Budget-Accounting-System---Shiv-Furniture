"use client";

// Wrapped by PortalLayout; no AppLayout to avoid duplicate nav
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { Download } from "lucide-react";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "failed"
  | "warning";

interface PortalInvoiceRow {
  id: string;
  recordId?: string;
  amount: string;
  dueDate: string;
  status: StatusType;
  statusLabel?: string;
  issueDate: string;
}

export default function PortalInvoicesPage() {
  const [portalInvoicesData, setPortalInvoicesData] = useState<
    PortalInvoiceRow[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PortalInvoiceRow[]>(
          "/portal/invoices?view=table",
        );
        setPortalInvoicesData(data ?? []);
      } catch (error) {
        console.error("Failed to load portal invoices:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    exportTableToPDF(
      "My Invoices",
      [
        { header: "Date", key: "issueDate" },
        { header: "Invoice #", key: "id" },
        { header: "Amount", key: "amount" },
        { header: "Due Date", key: "dueDate" },
        { header: "Status", key: "statusLabel" },
      ],
      portalInvoicesData.map(row => ({
        ...row,
        statusLabel: row.statusLabel || row.status
      })),
      "My_Invoices.pdf"
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
      render: (value: string, row: PortalInvoiceRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-heading mb-2">My Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Download and view your invoices
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export as PDF
        </button>
      </div>

      <DataTable columns={columns} data={portalInvoicesData} />
    </div>
  );
}
