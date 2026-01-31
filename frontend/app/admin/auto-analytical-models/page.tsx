"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import { Plus, X } from "lucide-react";

type DocType = "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";

interface RuleDraft {
  docType: DocType;
  matchProductId: string | null;
  matchCategoryId: string | null;
  matchContactId: string | null;
  assignAnalyticAccountId: string;
  rulePriority: number;
}

interface ModelDraft {
  companyId: string;
  name: string;
  priority: number;
  rules: RuleDraft[];
}

export default function AutoAnalyticalModelsPage() {
  const [models, setModels] = useState<ModelDraft[]>([]);
  const [open, setOpen] = useState(false);

  const handleCreate = (draft: ModelDraft) => {
    setModels((prev) => [draft, ...prev]);
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[32px] border border-brand-primary/30 bg-slate-900/95 p-6 text-brand-light shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-wide">
            <span className="rounded-full border border-brand-primary/30 px-5 py-2 text-brand-light">Auto Analytical Models</span>
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-full border border-brand-primary/40 bg-brand-primary/20 px-6 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> New Mapping
              </button>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">Define rules to auto-assign cost centers</p>
            <h1 className="text-3xl font-semibold text-white">Auto Analytical Model</h1>
          </div>
        </header>

        <section className="rounded-[32px] border border-slate-200/40 bg-white/70 p-6 shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60">
          {models.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              No models yet. Create a mapping to get started.
            </p>
          ) : (
            <div className="space-y-6">
              {models.map((m, idx) => (
                <article key={idx} className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-brand-primary">Priority {m.priority}</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{m.name}</h3>
                      <p className="text-xs text-brand-accent">Company: {m.companyId}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {m.rules.map((r, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">
                        <div className="flex flex-wrap gap-2 text-slate-700 dark:text-slate-300">
                          <span className="rounded-full border px-2 py-0.5 text-xs">{r.docType}</span>
                          {r.matchProductId && <span className="rounded-full border px-2 py-0.5 text-xs">product: {r.matchProductId}</span>}
                          {r.matchCategoryId && <span className="rounded-full border px-2 py-0.5 text-xs">category: {r.matchCategoryId}</span>}
                          {r.matchContactId && <span className="rounded-full border px-2 py-0.5 text-xs">partner: {r.matchContactId}</span>}
                          <span className="rounded-full border px-2 py-0.5 text-xs">assign: {r.assignAnalyticAccountId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {open && (
        <ModelDialog
          onClose={() => setOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </AppLayout>
  );
}

function ModelDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: ModelDraft) => void }) {
  const [model, setModel] = useState<ModelDraft>({ companyId: "00000000-0000-0000-0000-000000000000", name: "", priority: 100, rules: [] });
  const [rule, setRule] = useState<RuleDraft>({ docType: "sales_order", matchProductId: "", matchCategoryId: "", matchContactId: "", assignAnalyticAccountId: "", rulePriority: 100 });

  const handleChange = <K extends keyof ModelDraft>(key: K, value: ModelDraft[K]) => setModel((p) => ({ ...p, [key]: value }));
  const handleRuleChange = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) => setRule((p) => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[24px] border border-brand-primary/40 bg-slate-900 p-8 text-brand-light shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">New Auto Analytical Model</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const rules: RuleDraft[] = [
              {
                ...rule,
                matchProductId: rule.matchProductId ? rule.matchProductId : null,
                matchCategoryId: rule.matchCategoryId ? rule.matchCategoryId : null,
                matchContactId: rule.matchContactId ? rule.matchContactId : null,
              },
            ];
            onSubmit({ ...model, rules });
          }}
          className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <div className="space-y-5">
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Company ID
              <input
                required
                value={model.companyId}
                onChange={(e) => handleChange("companyId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Model Name
              <input
                required
                value={model.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Priority
              <input
                type="number"
                min={1}
                value={model.priority}
                onChange={(e) => handleChange("priority", Number(e.target.value) || 100)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
              />
            </label>
          </div>
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">Rule</p>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Document Type
              <select
                value={rule.docType}
                onChange={(e) => handleRuleChange("docType", e.target.value as DocType)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="sales_order">Sales Order</option>
                <option value="purchase_order">Purchase Order</option>
                <option value="customer_invoice">Customer Invoice</option>
                <option value="vendor_bill">Vendor Bill</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Product ID (optional)
              <input
                value={rule.matchProductId ?? ""}
                onChange={(e) => handleRuleChange("matchProductId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Category ID (optional)
              <input
                value={rule.matchCategoryId ?? ""}
                onChange={(e) => handleRuleChange("matchCategoryId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Partner ID (optional)
              <input
                value={rule.matchContactId ?? ""}
                onChange={(e) => handleRuleChange("matchContactId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Assign Analytic Account ID
              <input
                required
                value={rule.assignAnalyticAccountId}
                onChange={(e) => handleRuleChange("assignAnalyticAccountId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              />
            </label>
          </div>
          <div className="lg:col-span-2 flex gap-3">
            <button type="submit" className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white">
              Save Model
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-light">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
