"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const contactsData = [
  {
    id: "CON001",
    name: "ABC Manufacturing Co.",
    type: "Customer",
    email: "contact@abc.com",
    phone: "+1 (555) 123-4567",
    status: "active" as const,
  },
  {
    id: "CON002",
    name: "Global Trading LLC",
    type: "Vendor",
    email: "purchase@global.com",
    phone: "+1 (555) 234-5678",
    status: "active" as const,
  },
  {
    id: "CON003",
    name: "Premium Retail Group",
    type: "Customer",
    email: "accounts@retail.com",
    phone: "+1 (555) 345-6789",
    status: "active" as const,
  },
  {
    id: "CON004",
    name: "Tech Solutions Inc.",
    type: "Vendor",
    email: "billing@tech.com",
    phone: "+1 (555) 456-7890",
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
