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

interface PaymentRow {
  id: string;
  recordId?: string;
  description: string;
  amount: string;
  date: string;
  method: string;
  status: StatusType;
  statusLabel?: string;
}

export default function PaymentsPage() {
  const [paymentsData, setPaymentsData] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<PaymentRow[]>(
          `/payments?companyId=${DEFAULT_COMPANY_ID}&view=table`,
        );
        setPaymentsData(data ?? []);
      } catch (error) {
        console.error("Failed to load payments:", error);
      }
    };

    load();
  }, []);

  const handleExportPDF = () => {
    const pdfData = paymentsData.map(payment => ({
      date: payment.date,
      id: payment.id,
      description: payment.description,
      amount: payment.amount,
      method: payment.method,
      status: payment.statusLabel || payment.status,
    }));

    exportTableToPDF(
      "Payments Report",
      [
        { header: "Date", key: "date" },
        { header: "Payment #", key: "id" },
        { header: "Description", key: "description" },
        { header: "Amount", key: "amount" },
        { header: "Method", key: "method" },
        { header: "Status", key: "status" },
      ],
      pdfData,
      "Payments_Report.pdf"
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
      render: (value: string, row: PaymentRow) => (
        <StatusBadge status={value as any} label={row.statusLabel ?? value} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Payments</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all incoming and outgoing payments
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Payment
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={paymentsData} />
    </AppLayout>
  );
}
