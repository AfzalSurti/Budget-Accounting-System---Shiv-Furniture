"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useMemo, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";

type AnalyticStatus = "new" | "confirm" | "archived";

interface AnalyticAccount {
  id: string;
  name: string;
  code: string;
  status: AnalyticStatus;
}

interface Draft extends Omit<AnalyticAccount, "id" | "status"> {}

const INITIAL: AnalyticAccount[] = [
  { id: "AA001", name: "Deepawali", code: "CC-100", status: "confirm" },
  { id: "AA002", name: "Marriage Session", code: "CC-200", status: "confirm" },
  { id: "AA003", name: "Furniture Expo 2026", code: "CC-300", status: "confirm" },
];

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticAccount[]>(INITIAL);
  const [dialog, setDialog] = useState<{ type: "create" | "edit"; row?: AnalyticAccount } | null>(null);

  const filtered = useMemo(() => rows, [rows]);

  const create = (draft: Draft) => {
    const nextId = `AA${(rows.length + 1).toString().padStart(3, "0")}`;
    setRows((prev) => [...prev, { id: nextId, status: "confirm", ...draft }]);
    setDialog(null);
  };
  const update = (id: string, draft: Draft) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...draft } : r)));
    setDialog(null);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[32px] border border-brand-primary/20 bg-white p-6 text-brand-dark shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-brand-primary/30 dark:bg-slate-900/95 dark:text-brand-light dark:shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white">Cost Centers</h1>
            <button
              onClick={() => setDialog({ type: "create" })}
              className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90 dark:bg-brand-primary/20 dark:text-white dark:hover:bg-brand-primary/30"
            >
              <Plus className="h-4 w-4" /> New Cost Center
            </button>
          </div>
        </header>

        <section className="rounded-[32px] border border-slate-200/40 bg-white/70 p-6 shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="space-y-4">
            {filtered.map((row) => (
              <article key={row.id} className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-brand-primary">{row.id}</p>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{row.name}</h3>
                    <p className="text-xs text-brand-accent">Code: {row.code}</p>
                  </div>
                  <button
                    onClick={() => setDialog({ type: "edit", row })}
                    className="rounded-full border border-brand-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary dark:border-brand-primary/40 dark:text-brand-light"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                No cost centers under this state yet. Use New to create one.
              </p>
            )}
          </div>
        </section>
      </div>

      {dialog && (
        <EditDialog
          mode={dialog.type}
          initial={dialog.row ?? null}
          onClose={() => setDialog(null)}
          onSubmit={(d) => (dialog.type === "create" ? create(d) : update(dialog.row!.id, d))}
        />
      )}
    </AppLayout>
  );
}

function EditDialog({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial: AnalyticAccount | null;
  onClose: () => void;
  onSubmit: (draft: Draft) => void;
}) {
  const [form, setForm] = useState<Draft>({ name: initial?.name ?? "", code: initial?.code ?? "" });
  const handle = (key: keyof Draft, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const title = mode === "create" ? "Add Cost Center" : "Edit Cost Center";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[36px] border border-brand-primary/40 bg-slate-900 p-8 text-brand-light shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="mt-6 space-y-6"
        >
          <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => handle("name", e.target.value)}
              className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
            Code
            <input
              required
              value={form.code}
              onChange={(e) => handle("code", e.target.value)}
              className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
            />
          </label>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white">
              {mode === "create" ? "Create" : "Update"}
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
