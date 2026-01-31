"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet, apiPost } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

type DocType = "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";

interface RuleDraft {
  docType: DocType;
  matchProductId: string | null;
  matchCategoryId: string | null;
  matchContactId: string | null;
  matchContactTagId: string | null;
  assignAnalyticAccountId: string;
  rulePriority: number;
}

interface ModelDraft {
  name: string;
  priority: number;
  rules: RuleDraft[];
}

interface BackendModel {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  rules: RuleDraft[];
}

interface ProductOption { id: string; name: string; }
interface CategoryOption { id: string; name: string; }
interface ContactOption { id: string; displayName: string; }
interface CostCenterOption { id: string; name: string; }
interface TagOption { id: string; name: string; }

export default function AutoAnalyticalModelsPage() {
  const [models, setModels] = useState<BackendModel[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterOption[]>([]);
  const [contactTags, setContactTags] = useState<TagOption[]>([]);

  const maps = useMemo(() => {
    const product = new Map(products.map((p) => [p.id, p.name]));
    const category = new Map(categories.map((c) => [c.id, c.name]));
    const contact = new Map(contacts.map((c) => [c.id, c.displayName]));
    const costCenter = new Map(costCenters.map((c) => [c.id, c.name]));
    const tag = new Map(contactTags.map((t) => [t.id, t.name]));
    return { product, category, contact, costCenter, tag };
  }, [products, categories, contacts, costCenters, contactTags]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [modelsData, productData, categoryData, contactData, costCenterData, tagData] = await Promise.all([
          apiGet<BackendModel[]>(`/auto-analytical-models?companyId=${DEFAULT_COMPANY_ID}`),
          apiGet<ProductOption[]>(`/products?companyId=${DEFAULT_COMPANY_ID}`),
          apiGet<CategoryOption[]>(`/product-categories?companyId=${DEFAULT_COMPANY_ID}`),
          apiGet<ContactOption[]>(`/contacts?companyId=${DEFAULT_COMPANY_ID}`),
          apiGet<CostCenterOption[]>(`/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`),
          apiGet<TagOption[]>(`/contact-tags?companyId=${DEFAULT_COMPANY_ID}`),
        ]);
        setModels(modelsData ?? []);
        setProducts(productData ?? []);
        setCategories(categoryData ?? []);
        setContacts(contactData ?? []);
        setCostCenters(costCenterData ?? []);
        setContactTags(tagData ?? []);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load auto-analytical models";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (draft: ModelDraft) => {
    const payload = {
      companyId: DEFAULT_COMPANY_ID,
      name: draft.name,
      priority: draft.priority,
      rules: draft.rules.map((rule) => ({
        ...rule,
        matchProductId: rule.matchProductId || null,
        matchCategoryId: rule.matchCategoryId || null,
        matchContactId: rule.matchContactId || null,
        matchContactTagId: rule.matchContactTagId || null,
      })),
    };
    const created = await apiPost<BackendModel, typeof payload>("/auto-analytical-models", payload);
    setModels((prev) => [created, ...prev]);
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
          {error && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          {loading ? (
            <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              Loading models...
            </p>
          ) : models.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              No models yet. Create a mapping to get started.
            </p>
          ) : (
            <div className="space-y-6">
              {models.map((m) => (
                <article key={m.id} className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-brand-primary">Priority {m.priority}</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{m.name}</h3>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {m.rules.map((r, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">
                        <div className="flex flex-wrap gap-2 text-slate-700 dark:text-slate-300">
                          <span className="rounded-full border px-2 py-0.5 text-xs">{r.docType}</span>
                          {r.matchProductId && <span className="rounded-full border px-2 py-0.5 text-xs">product: {maps.product.get(r.matchProductId) ?? r.matchProductId}</span>}
                          {r.matchCategoryId && <span className="rounded-full border px-2 py-0.5 text-xs">category: {maps.category.get(r.matchCategoryId) ?? r.matchCategoryId}</span>}
                          {r.matchContactId && <span className="rounded-full border px-2 py-0.5 text-xs">partner: {maps.contact.get(r.matchContactId) ?? r.matchContactId}</span>}
                          {r.matchContactTagId && <span className="rounded-full border px-2 py-0.5 text-xs">tag: {maps.tag.get(r.matchContactTagId) ?? r.matchContactTagId}</span>}
                          <span className="rounded-full border px-2 py-0.5 text-xs">assign: {maps.costCenter.get(r.assignAnalyticAccountId) ?? r.assignAnalyticAccountId}</span>
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
          products={products}
          categories={categories}
          contacts={contacts}
          costCenters={costCenters}
          contactTags={contactTags}
        />
      )}
    </AppLayout>
  );
}

function ModelDialog({
  onClose,
  onSubmit,
  products,
  categories,
  contacts,
  costCenters,
  contactTags,
}: {
  onClose: () => void;
  onSubmit: (draft: ModelDraft) => void;
  products: ProductOption[];
  categories: CategoryOption[];
  contacts: ContactOption[];
  costCenters: CostCenterOption[];
  contactTags: TagOption[];
}) {
  const [model, setModel] = useState<ModelDraft>({ name: "", priority: 100, rules: [] });
  const [rule, setRule] = useState<RuleDraft>({
    docType: "sales_order",
    matchProductId: null,
    matchCategoryId: null,
    matchContactId: null,
    matchContactTagId: null,
    assignAnalyticAccountId: "",
    rulePriority: 100,
  });

  const handleChange = <K extends keyof ModelDraft>(key: K, value: ModelDraft[K]) => setModel((p) => ({ ...p, [key]: value }));
  const handleRuleChange = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) => setRule((p) => ({ ...p, [key]: value }));

  const addRule = () => {
    const hasMatch =
      Boolean(rule.matchProductId) ||
      Boolean(rule.matchCategoryId) ||
      Boolean(rule.matchContactId) ||
      Boolean(rule.matchContactTagId);
    if (!hasMatch || !rule.assignAnalyticAccountId) return;
    setModel((prev) => ({ ...prev, rules: [...prev.rules, rule] }));
    setRule({
      docType: "sales_order",
      matchProductId: null,
      matchCategoryId: null,
      matchContactId: null,
      matchContactTagId: null,
      assignAnalyticAccountId: "",
      rulePriority: 100,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[24px] border border-brand-primary/40 bg-slate-900 p-8 text-brand-light shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">New Auto Analytical Model</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...model, rules: model.rules.length > 0 ? model.rules : [rule] });
          }}
          className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <div className="space-y-5">
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
            {model.rules.length > 0 && (
              <div className="rounded-xl border border-brand-primary/20 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-brand-accent mb-2">Rules ({model.rules.length})</p>
                <div className="space-y-2">
                  {model.rules.map((r, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border px-2 py-0.5">{r.docType}</span>
                      {r.matchProductId && <span className="rounded-full border px-2 py-0.5">product</span>}
                      {r.matchCategoryId && <span className="rounded-full border px-2 py-0.5">category</span>}
                      {r.matchContactId && <span className="rounded-full border px-2 py-0.5">partner</span>}
                      {r.matchContactTagId && <span className="rounded-full border px-2 py-0.5">tag</span>}
                      <span className="rounded-full border px-2 py-0.5">assign</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">Rule Builder</p>
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
              Match Product (optional)
              <select
                value={rule.matchProductId ?? ""}
                onChange={(e) => handleRuleChange("matchProductId", e.target.value || null)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="">Any</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Category (optional)
              <select
                value={rule.matchCategoryId ?? ""}
                onChange={(e) => handleRuleChange("matchCategoryId", e.target.value || null)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Partner (optional)
              <select
                value={rule.matchContactId ?? ""}
                onChange={(e) => handleRuleChange("matchContactId", e.target.value || null)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="">Any</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Match Partner Tag (optional)
              <select
                value={rule.matchContactTagId ?? ""}
                onChange={(e) => handleRuleChange("matchContactTagId", e.target.value || null)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="">Any</option>
                {contactTags.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Assign Cost Center
              <select
                value={rule.assignAnalyticAccountId}
                onChange={(e) => handleRuleChange("assignAnalyticAccountId", e.target.value)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              >
                <option value="">Select</option>
                {costCenters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">
              Rule Priority
              <input
                type="number"
                min={1}
                value={rule.rulePriority}
                onChange={(e) => handleRuleChange("rulePriority", Number(e.target.value) || 100)}
                className="mt-1 w-full border-b border-dashed border-brand-primary bg-transparent px-1 py-2 focus:border-brand-accent focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={addRule}
              className="w-full rounded-full border border-brand-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Add Rule
            </button>
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
