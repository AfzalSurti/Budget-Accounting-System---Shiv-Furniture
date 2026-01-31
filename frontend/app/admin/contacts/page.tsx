"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const contactsData = [
  {
    id: "CON001",
    name: "Bharat Industries Pvt. Ltd.",
    type: "Customer",
    email: "sales@bharatindustries.in",
    phone: "+91 98765 43210",
    status: "active" as const,
  },
  {
    id: "CON002",
    name: "Sharma Traders",
    type: "Vendor",
    email: "procurement@sharmatraders.in",
    phone: "+91 90123 45678",
    status: "active" as const,
  },
  {
    id: "CON003",
    name: "Gupta & Sons",
    type: "Customer",
    email: "accounts@guptaandsons.in",
    phone: "+91 91234 56780",
    status: "active" as const,
  },
  {
    id: "CON004",
    name: "Desi Retail Pvt. Ltd.",
    type: "Vendor",
    email: "billing@desiretail.in",
    phone: "+91 99876 54321",
    status: "active" as const,
  },
];

export default function ContactsPage() {
  const columns = [
    {
      key: "name" as const,
      label: "Name",
      sortable: true,
    },
    {
      key: "type" as const,
      label: "Type",
      render: (value: string) => (
        <span className={`font-medium ${value === "Customer" ? "text-blue-700 dark:text-blue-400" : "text-purple-700 dark:text-purple-400"}`}>
          {value}
        </span>
      ),
    },
    {
      key: "email" as const,
      label: "Email",
    },
    {
      key: "phone" as const,
      label: "Phone",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Contacts</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage customers and vendors</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      <DataTable columns={columns} data={contactsData} />  );
}
