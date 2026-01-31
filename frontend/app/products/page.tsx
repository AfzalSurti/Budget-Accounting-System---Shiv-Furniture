"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Plus, UploadCloud, X } from "lucide-react";

type ProductStatus = "new" | "confirm" | "archived";

interface ProductRecord {
  id: string;
  name: string;
  category: string;
  salesPrice: number;
  purchasePrice: number;
  status: ProductStatus;
}

interface ProductDraft {
  name: string;
  category: string;
  salesPrice: number;
  purchasePrice: number;
}

const DEFAULT_CATEGORIES = ["Living", "Office", "Outdoor", "Bedroom"];

const INITIAL_PRODUCTS: ProductRecord[] = [
  { id: "PRD001", name: "Regent Sofa", category: "Living", salesPrice: 22500, purchasePrice: 15250, status: "confirm" },
  { id: "PRD002", name: "Aero Work Desk", category: "Office", salesPrice: 18200, purchasePrice: 12100, status: "confirm" },
  { id: "PRD003", name: "Verve Patio Chair", category: "Outdoor", salesPrice: 7500, purchasePrice: 4800, status: "new" },
  { id: "PRD004", name: "Noir Bed Frame", category: "Bedroom", salesPrice: 28990, purchasePrice: 21000, status: "archived" },
];

const FILTER_TABS: { label: string; value: ProductStatus | "all" }[] = [
  { label: "New", value: "new" },
  { label: "Confirm", value: "confirm" },
  { label: "Archived", value: "archived" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<ProductStatus | "all">("confirm");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((product) => product.status === activeTab);
  }, [products, activeTab]);

  const handleCreateProduct = (draft: ProductDraft) => {
    const nextId = `PRD${(products.length + 1).toString().padStart(3, "0")}`;
    const record: ProductRecord = { id: nextId, status: "confirm", ...draft };
    setProducts((prev) => [...prev, record]);
    setActiveTab("confirm");
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[32px] border border-pink-200/30 bg-slate-900/95 p-6 text-pink-100 shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-wide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full border px-5 py-2 transition ${
                  activeTab === tab.value
                    ? "border-pink-300 bg-pink-300/10 text-pink-50"
                    : "border-pink-200/30 text-pink-200 hover:border-pink-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex gap-3">
              <button className="rounded-full border border-pink-200/30 px-5 py-2 text-pink-200 hover:border-pink-200/60">
                Home
              </button>
              <button className="rounded-full border border-pink-200/30 px-5 py-2 text-pink-200 hover:border-pink-200/60">
                Back
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-pink-300">Master Data</p>
              <h1 className="text-3xl font-semibold text-pink-50">Products</h1>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-pink-500/20 px-6 py-3 text-sm font-semibold text-pink-50 transition hover:bg-pink-500/30"
            >
              <Plus className="h-4 w-4" />
              New Product
            </button>
          </div>
        </header>

        <section className="rounded-[32px] border border-pink-100/40 bg-black text-pink-100 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="rounded-t-[32px] border-b border-pink-200/40 px-8 py-4 text-sm uppercase tracking-[0.4em]">
            Product Name
          </div>
          <div className="divide-y divide-pink-200/20">
            {filteredProducts.map((product) => (
              <article key={product.id} className="grid gap-4 px-8 py-5 text-sm md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-pink-400">{product.id}</p>
                  <p className="text-lg font-semibold">{product.name}</p>
                  <p className="text-xs text-pink-300">Category: {product.category}</p>
                </div>
                <div className="text-pink-200">
                  <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Sales Price</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(product.salesPrice)}</p>
                </div>
                <div className="text-pink-200">
                  <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Purchase Price</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(product.purchasePrice)}</p>
                </div>
                <div className="flex items-center justify-end">
                  <span className="rounded-full border border-pink-200/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-pink-200">
                    {product.status}
                  </span>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <p className="px-8 py-10 text-center text-sm text-pink-300">
                No products under this state yet. Use the New Product dialog to create one.
              </p>
            )}
          </div>
        </section>
      </div>
      {dialogOpen && (
        <ProductDialog
          categories={categories}
          onCreateCategory={(value) =>
            setCategories((prev) => (prev.includes(value) ? prev : [...prev, value]))
          }
          onSubmit={handleCreateProduct}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </AppLayout>
  );
}

function ProductDialog({
  categories,
  onSubmit,
  onClose,
  onCreateCategory,
}: {
  categories: string[];
  onSubmit: (draft: ProductDraft) => void;
  onClose: () => void;
  onCreateCategory: (value: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    category: categories[0] ?? "",
    salesPrice: "",
    purchasePrice: "",
  });
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(categories);

  // Keep local options in sync when parent list changes.
  useEffect(() => {
    setCategoryOptions(categories);
    setForm((prev) => {
      if (prev.category && categories.includes(prev.category)) {
        return prev;
      }
      return { ...prev, category: categories[0] ?? "" };
    });
  }, [categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sales = Number(form.salesPrice || 0);
    const purchase = Number(form.purchasePrice || 0);
    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      salesPrice: sales,
      purchasePrice: purchase,
    });
  };

  const handleAddCategory = () => {
    const value = categoryDraft.trim();
    if (!value) return;
    onCreateCategory(value);
    if (!categoryOptions.includes(value)) {
      setCategoryOptions((prev) => [...prev, value]);
    }
    setForm((prev) => ({ ...prev, category: value }));
    setCategoryDraft("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[36px] border border-pink-200/40 bg-slate-900 p-8 text-pink-100 shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-pink-200/20 pb-4">
          <h2 className="text-2xl font-semibold">Create Product</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-pink-200/40 p-2 hover:bg-pink-500/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Product Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border-b border-dashed border-pink-300 bg-transparent px-1 py-2 text-lg focus:border-pink-100 focus:outline-none"
              />
            </FormField>
            <FormField label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-full border border-pink-200/40 bg-transparent px-4 py-2 text-sm focus:border-pink-100 focus:outline-none"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex gap-2">
                <input
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  placeholder="Create & Save on the fly"
                  className="flex-1 rounded-full border border-pink-200/40 bg-transparent px-3 py-2 text-sm focus:border-pink-100 focus:outline-none"
                />
                <button type="button" onClick={handleAddCategory} className="rounded-full border border-pink-200/40 px-4 py-2 text-sm font-semibold">
                  Save
                </button>
              </div>
            </FormField>
            <FormField label="Sales Price">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.salesPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, salesPrice: e.target.value }))}
                className="w-full border-b border-dashed border-pink-300 bg-transparent px-1 py-2 text-lg focus:border-pink-100 focus:outline-none"
              />
              <p className="mt-1 text-xs text-pink-300">Shown as Rs value inside the catalog.</p>
            </FormField>
            <FormField label="Purchase Price">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                className="w-full border-b border-dashed border-pink-300 bg-transparent px-1 py-2 text-lg focus:border-pink-100 focus:outline-none"
              />
            </FormField>
          </div>
          <div className="rounded-3xl border border-pink-200/40 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-pink-200">Upload image</p>
            <p className="mt-2 text-xs text-pink-300">Optional reference render</p>
            <label className="mt-4 inline-flex items-center gap-2 rounded-full border border-pink-200/60 px-5 py-2 text-sm font-semibold">
              <UploadCloud className="h-4 w-4" />
              <input type="file" className="hidden" accept="image/*" />
              Attach File
            </label>
          </div>
          <p className="text-xs text-pink-300">
            *Category can be created and saved on the fly (many-to-one). All product creations flow through this dialog to keep master data curated.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="flex-1 rounded-full border border-pink-200/60 bg-pink-500/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-pink-50">
              Create
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-pink-200/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-pink-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-pink-200">
      {label}
      <div className="mt-1 space-y-2">{children}</div>
    </label>
  );
}

function formatPrice(value: number) {
  return `${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Rs`;
}
