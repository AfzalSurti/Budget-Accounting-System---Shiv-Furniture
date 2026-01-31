"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  LineChart,
  Landmark,
  Layers,
  FileCheck,
  Users,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="page-container pt-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_dark.png"
              alt="Shiv Furniture ERP"
              width={280}
              height={96}
              className="h-20 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo_light.png"
              alt="Shiv Furniture ERP"
              width={280}
              height={96}
              className="h-20 w-auto hidden dark:block"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost px-5 py-2">
              Login
            </Link>
            <Link href="/signup" className="btn-primary px-5 py-2">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="page-container pt-12 pb-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              <Sparkles className="w-4 h-4" />
              Enterprise Budget Intelligence
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-dark dark:text-white leading-tight"
            >
              Financial Control. Budget Intelligence. Real Decisions.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Give finance leaders a real-time command center for budgets, cost centers, and cash flow—so every decision is accountable and confident.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30"
              >
                View Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how"
                className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-base border border-brand-primary/20"
              >
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg shadow-xl shadow-brand-primary/10 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget Control Center</p>
                  <h3 className="text-lg font-semibold text-brand-dark dark:text-white">Q1 Allocation Overview</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Utilization</p>
                  <p className="text-xl font-semibold text-brand-primary">86.4%</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Manufacturing", "Sales", "Operations"].map((item, idx) => (
                  <div key={item} className="rounded-lg border border-slate-200/70 dark:border-slate-800 p-3 bg-white/80 dark:bg-slate-900/70">
                    <p className="text-xs text-slate-500">{item}</p>
                    <p className="text-lg font-semibold text-brand-dark dark:text-white">
                      ₹{["1.8M", "980K", "620K"][idx]}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-brand-primary"
                        style={{ width: ["78%", "62%", "71%"][idx] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Budget vs Actual</span>
                  <span className="text-brand-primary font-semibold">+4.2% variance</span>
                </div>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {[46, 54, 58, 64, 71, 77].map((height) => (
                    <div key={height} className="h-20 flex items-end">
                      <div className="w-full rounded-md bg-brand-primary/20" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg shadow-lg shadow-brand-primary/10 p-4 w-48"
            >
              <p className="text-xs text-slate-500">Cash Forecast</p>
              <p className="text-lg font-semibold text-brand-dark dark:text-white">₹4.28M</p>
              <p className="text-xs text-emerald-600">On track</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-2 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg shadow-lg shadow-brand-primary/10 p-4 w-48"
            >
              <p className="text-xs text-slate-500">Open Approvals</p>
              <p className="text-lg font-semibold text-brand-dark dark:text-white">12 pending</p>
              <p className="text-xs text-amber-600">2 high priority</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="page-container py-16">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Core Capabilities</p>
            <h2 className="text-3xl font-semibold text-brand-dark dark:text-white">Enterprise control without the noise</h2>
          </div>
          <Link href="/reports" className="btn-ghost border border-slate-200 dark:border-slate-700">
            View analytics
          </Link>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Landmark,
              title: "Budget Governance",
              description: "Enforce budget limits with approvals, ownership, and automatic variance alerts.",
            },
            {
              icon: LineChart,
              title: "Decision Intelligence",
              description: "Know what to fund next with real-time spend, forecast, and scenario modeling.",
            },
            {
              icon: Layers,
              title: "Cost Center Clarity",
              description: "Track spend across teams and projects with structured cost center hierarchies.",
            },
            {
              icon: Users,
              title: "Vendor & Portal Control",
              description: "Give stakeholders a secure view of invoices, payments, and PO status.",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="card p-6 hover:shadow-xl hover:shadow-brand-primary/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-lighter/70 dark:bg-slate-800 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Differentiation */}
      <section id="how" className="page-container py-16">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-slate-500">
              How Shiv Furniture Stays in Control
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-semibold text-brand-dark dark:text-white">
              Every rupee traced from budget to payment.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-300">
              Shiv Furniture maps every allocation to cost centers, invoices, and payments—so leaders always know what is approved, spent, and remaining.
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-4">
              {[
                { label: "Budget released", value: "₹2.4M", progress: "78%" },
                { label: "Invoices matched", value: "₹1.7M", progress: "62%" },
                { label: "Payments cleared", value: "₹1.2M", progress: "48%" },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-semibold text-brand-dark dark:text-white">{row.value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-brand-primary" style={{ width: row.progress }} />
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg shadow-xl shadow-brand-primary/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Control Flow</p>
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white">Budget → Cost Center → Invoice → Payment</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-lighter/70 text-brand-primary">Live</span>
            </div>
            <div className="space-y-4">
              {["Budget release", "Cost center allocation", "Invoice validation", "Payment clearance"].map((step, idx) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-lighter/70 dark:bg-slate-800 flex items-center justify-center text-brand-primary font-semibold">
                    0{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-dark dark:text-white">{step}</p>
                    <p className="text-xs text-slate-500">Automated checks and approvals in real time.</p>
                  </div>
                  <div className="text-xs text-emerald-600">Completed</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="page-container py-14">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enterprise credibility</p>
              <h3 className="text-2xl font-semibold text-brand-dark dark:text-white">Built with enterprise-grade controls</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: ShieldCheck, label: "Secure by design" },
                { icon: Users, label: "Role-based access" },
                { icon: FileCheck, label: "Audit-ready trails" },
                { icon: LineChart, label: "Real-time analytics" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3">
                  <badge.icon className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16">
        <div className="rounded-2xl border border-brand-primary/20 bg-[#0B1C3F] text-white p-10 lg:p-14 shadow-2xl shadow-brand-primary/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Take control</p>
              <h2 className="text-3xl font-semibold">Take control of your budgets today.</h2>
              <p className="text-blue-100 mt-2">Move from spreadsheet chaos to enterprise-grade financial intelligence in weeks.</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors duration-200"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-slate-800 py-10">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-brand-dark dark:text-white">Shiv Furniture ERP</p>
              <p className="text-xs text-slate-500">Enterprise Budget & Financial Intelligence</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <Link href="#features" className="hover:text-brand-primary">Capabilities</Link>
              <Link href="#how" className="hover:text-brand-primary">How it works</Link>
              <Link href="/login" className="hover:text-brand-primary">Login</Link>
              <Link href="/signup" className="hover:text-brand-primary">Sign up</Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-400">© 2026 Shiv Furniture ERP. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
