"use client";

import Link from "next/link";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { Card, FileText, DollarSign, Clock } from "lucide-react";

export default function PortalDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNavigation />

      <main className="page-container">
        {/* Portal Header */}
        <div className="mb-12">
          <h1 className="section-heading mb-2">Customer Portal</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage your invoices, bills, and purchase orders
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Outstanding Invoices", value: "3", icon: FileText, color: "text-brand-primary" },
            { label: "Total Outstanding", value: "$38,450", icon: DollarSign, color: "text-brand-accent" },
            { label: "Due Soon", value: "2", icon: Clock, color: "text-warning" },
            { label: "Recent Payments", value: "12", icon: Card, color: "text-success" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold font-mono text-brand-dark dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Portal Navigation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/portal/invoices" className="card p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand-lighter dark:bg-slate-800 rounded-lg">
                <FileText className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">My Invoices</h3>
                <p className="text-slate-600 dark:text-slate-400">View and manage your invoices</p>
              </div>
            </div>
            <p className="text-brand-primary font-semibold">View Invoices →</p>
          </Link>

          <Link href="/portal/bills" className="card p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand-lighter dark:bg-slate-800 rounded-lg">
                <DollarSign className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">My Bills</h3>
                <p className="text-slate-600 dark:text-slate-400">View and pay vendor bills</p>
              </div>
            </div>
            <p className="text-brand-primary font-semibold">View Bills →</p>
          </Link>

          <Link href="/portal/purchase-orders" className="card p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand-lighter dark:bg-slate-800 rounded-lg">
                <Card className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">Purchase Orders</h3>
                <p className="text-slate-600 dark:text-slate-400">Track your purchase orders</p>
              </div>
            </div>
            <p className="text-brand-primary font-semibold">View POs →</p>
          </Link>

          <Link href="/portal/payments" className="card p-8 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand-lighter dark:bg-slate-800 rounded-lg">
                <Clock className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">Payments</h3>
                <p className="text-slate-600 dark:text-slate-400">View payment history</p>
              </div>
            </div>
            <p className="text-brand-primary font-semibold">View Payments →</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
