"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Plus } from "lucide-react";

export default function MasterDataPage() {
  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Master Data</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage core business data and configurations</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Products", count: "248", desc: "Product catalog and SKU management" },
          { title: "Customers", count: "54", desc: "Customer master records" },
          { title: "Vendors", count: "32", desc: "Vendor and supplier management" },
          { title: "Cost Centers", count: "12", desc: "Organizational cost center setup" },
          { title: "Accounts", count: "156", desc: "General ledger accounts" },
          { title: "Tax Codes", count: "18", desc: "Tax rates and codes" },
        ].map((item, idx) => (
          <div key={idx} className="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-dark dark:text-white">{item.title}</h3>
              <span className="text-2xl font-mono font-bold text-brand-accent">{item.count}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            <button className="mt-4 text-brand-primary font-semibold text-sm hover:text-brand-accent transition-colors">
              Manage →
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
