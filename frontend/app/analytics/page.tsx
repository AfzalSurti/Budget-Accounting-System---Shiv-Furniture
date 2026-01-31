"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";

type AnalyticStatus = "new" | "confirm" | "archived";

interface AnalyticAccount {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
  status: AnalyticStatus;
}

interface BackendAnalyticAccount {
  id: string;
  name: string;
  code: string | null;
  parentId?: string | null;
  isActive: boolean;
}

interface Draft extends Omit<AnalyticAccount, "id" | "status"> {}

const DEFAULT_NAMES = ["Manufacturing", "Sales", "Admin", "Operations", "Capital"];

const mapAccount = (row: BackendAnalyticAccount): AnalyticAccount => ({
  id: row.id,
  name: row.name,
  code: row.code ?? "",
  parentId: row.parentId ?? null,
  status: row.isActive ? "confirm" : "archived",
});

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticAccount[]>([]);
  const [dialog, setDialog] = useState<{ type: "create" | "edit"; row?: AnalyticAccount } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => rows, [rows]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<BackendAnalyticAccount[]>(
        `/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`,
      );
      const mapped = (data ?? []).map(mapAccount);
      const preferred = new Map<string, AnalyticAccount>();
      mapped.forEach((item) => {
        if (DEFAULT_NAMES.includes(item.name)) {
          preferred.set(item.name, item);
        }
      });
      const orderedDefaults = DEFAULT_NAMES.map((name) => preferred.get(name)).filter(Boolean) as AnalyticAccount[];
      const extras = mapped.filter((item) => !DEFAULT_NAMES.includes(item.name));
      setRows([...orderedDefaults, ...extras]);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load cost centers";
      console.error("Failed to load cost centers:", loadError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (draft: Draft) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPost<BackendAnalyticAccount, Record<string, unknown>>("/analytical-accounts", {
        companyId: DEFAULT_COMPANY_ID,
        name: draft.name.trim(),
        code: draft.code.trim() || null,
        parentId: draft.parentId ?? null,
      });
      await load();
      setDialog(null);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Failed to create cost center";
      console.error("Failed to create cost center:", createError);
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const update = async (id: string, draft: Draft) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPut<BackendAnalyticAccount, Record<string, unknown>>(`/analytical-accounts/${id}`, {
        name: draft.name.trim(),
        code: draft.code.trim() || null,
        parentId: draft.parentId ?? null,
      });
      await load();
      setDialog(null);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update cost center";
      console.error("Failed to update cost center:", updateError);
      setError(message);
    } finally {
      setIsSaving(false);
    }
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
          {error && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="space-y-4">
            {loading ? (
              <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                Loading cost centers from the database...
              </p>
            ) : (
              <>
                {filtered.map((row) => (
                  <article key={row.id} className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-brand-primary">{row.id}</p>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{row.name}</h3>
                        <p className="text-xs text-brand-accent">Code: {row.code || ""}</p>
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
              </>
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
          isSaving={isSaving}
          parentOptions={rows}
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
  isSaving,
  parentOptions,
}: {
  mode: "create" | "edit";
  initial: AnalyticAccount | null;
  onClose: () => void;
  onSubmit: (draft: Draft) => void;
  isSaving: boolean;
  parentOptions: AnalyticAccount[];
}) {
  const [form, setForm] = useState<Draft>({
    name: initial?.name ?? "",
    code: initial?.code ?? "",
    parentId: initial?.parentId ?? null,
  });
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
              value={form.code}
              onChange={(e) => handle("code", e.target.value)}
              className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
            Parent Cost Center (optional)
            <select
              value={form.parentId ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value || null }))}
              className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 text-lg focus:border-brand-accent focus:outline-none"
            >
              <option value="">None</option>
              {parentOptions
                .filter((opt) => opt.id !== initial?.id)
                .map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
