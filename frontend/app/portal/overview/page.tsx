"use client";

import Link from "next/link";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { FileText, IndianRupee, Clock, CreditCard, ShoppingCart, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalDashboard() {
  const summaryStats = [
    { 
      label: "Outstanding Invoices", 
      value: "3", 
      icon: FileText, 
      color: "text-brand-primary",
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
      status: null
    },
    { 
      label: "Amount Due", 
      value: "₹38,450", 
      icon: IndianRupee, 
      color: "text-slate-700 dark:text-slate-300",
      bgColor: "bg-slate-50 dark:bg-slate-800/50",
      status: null
    },
    { 
      label: "Due Soon", 
      value: "2", 
      icon: Clock, 
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/10",
      status: "Attention needed"
    },
    { 
      label: "Recent Payments", 
      value: "12", 
      icon: CreditCard, 
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      status: null
    },
  ];

  const actionCards = [
    {
      href: "/portal/invoices",
      icon: FileText,
      title: "My Invoices",
      description: "View all your invoices and payment status",
      actionText: "View Invoices",
      priority: "high"
    },
    {
      href: "/portal/bills",
      icon: IndianRupee,
      title: "My Bills",
      description: "Review and pay outstanding bills",
      actionText: "View Bills",
      priority: "high"
    },
    {
      href: "/portal/purchase-orders",
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Track your orders and delivery status",
      actionText: "View Orders",
      priority: "medium"
    },
    {
      href: "/portal/payments",
      icon: CreditCard,
      title: "Payment History",
      description: "See all your past payments and receipts",
      actionText: "View History",
      priority: "medium"
    },
  ];

  return (
    <div className="min-h-screen page-grid">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Portal Header - Welcoming & Reassuring */}
        <div className="mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-brand-dark dark:text-white mb-3">
                Welcome to Your Portal
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                View your invoices, bills, and payment history in one place. Everything you need to manage your account.
              </p>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Shield className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Your data is secure and private
            </span>
          </div>
        </div>

        {/* Summary Cards - What Matters Now */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
        >
          {summaryStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`card p-4 md:p-6 ${stat.bgColor} border-none`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
                    {stat.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-900 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-600 hidden sm:inline">
                          {stat.status}
                        </span>
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-white mb-2">
            What would you like to do?
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            Select an option below to get started
          </p>
        </div>

        {/* Primary Action Cards - Task-Driven */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {actionCards.map((card, idx) => {
            const Icon = card.icon;
            const isHighPriority = card.priority === "high";
            
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
              >
                <Link 
                  href={card.href} 
                  className={`block card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                    isHighPriority ? "p-6 md:p-8" : "p-5 md:p-7"
                  }`}
                >
                  <div className="flex items-start gap-4 md:gap-5 mb-4 md:mb-5">
                    <div className={`${isHighPriority ? "p-3.5" : "p-3"} bg-brand-primary/10 dark:bg-brand-primary/20 rounded-xl group-hover:bg-brand-primary/20 dark:group-hover:bg-brand-primary/30 transition-colors`}>
                      <Icon className={`${isHighPriority ? "w-7 h-7" : "w-6 h-6"} text-brand-primary`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`${isHighPriority ? "text-xl md:text-2xl" : "text-lg md:text-xl"} font-semibold text-brand-dark dark:text-white mb-2 group-hover:text-brand-primary transition-colors`}>
                        {card.title}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-primary font-semibold group-hover:gap-3 transition-all">
                    <span className="text-sm md:text-base">{card.actionText}</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="mt-12 p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-sm md:text-base text-center text-slate-600 dark:text-slate-400">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@shivfurniture.com" className="text-brand-primary hover:underline font-medium">
              support@shivfurniture.com
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
