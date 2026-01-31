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
  { id: "PRD001", name: "Sheesham Wood Sofa", category: "Living", salesPrice: 22500, purchasePrice: 15250, status: "confirm" },
  { id: "PRD002", name: "Teak Office Table", category: "Office", salesPrice: 18200, purchasePrice: 12100, status: "confirm" },
  { id: "PRD003", name: "Mango Wood Patio Chair", category: "Outdoor", salesPrice: 7500, purchasePrice: 4800, status: "new" },
  { id: "PRD004", name: "Neem Wood Bed Frame", category: "Bedroom", salesPrice: 28990, purchasePrice: 21000, status: "archived" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => products, [products]);

  const handleCreateProduct = (draft: ProductDraft) => {
    const nextId = `PRD${(products.length + 1).toString().padStart(3, "0")}`;
    const record: ProductRecord = { id: nextId, status: "confirm", ...draft };
    setProducts((prev) => [...prev, record]);
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[24px] border border-brand-primary/20 bg-white p-4 text-brand-dark shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-brand-primary/30 dark:bg-slate-900/95 dark:text-brand-light dark:shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-left text-2xl font-semibold text-brand-dark dark:text-brand-light">Products</h1>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-light dark:hover:bg-brand-primary/30"
            >
              <Plus className="h-4 w-4" />
              New Product
            </button>
          </div>
        </header>

        <section className="rounded-[32px] border border-brand-primary/20 bg-white text-brand-dark shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:bg-black dark:text-brand-light dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="rounded-t-[32px] border-b border-brand-primary/30 px-8 py-4 text-sm uppercase tracking-[0.4em]">
            Product Name
          </div>
          <div className="divide-y divide-brand-primary/20">
            {filteredProducts.map((product) => (
              <article key={product.id} className="grid gap-4 px-8 py-5 text-sm md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-brand-accent">{product.id}</p>
                  <p className="text-lg font-semibold">{product.name}</p>
                  <p className="text-xs text-brand-light/80">Category: {product.category}</p>
                </div>
                <div className="text-brand-dark/70 dark:text-brand-light/80">
                  <p className="text-xs uppercase tracking-[0.4em] text-brand-accent">Sales Price</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(product.salesPrice)}</p>
                </div>
                <div className="text-brand-dark/70 dark:text-brand-light/80">
                  <p className="text-xs uppercase tracking-[0.4em] text-brand-accent">Purchase Price</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(product.purchasePrice)}</p>
                </div>
                <div className="flex items-center justify-end">
                  <span className="rounded-full border border-brand-primary/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/70 dark:text-brand-light/80">
                    {product.status}
                  </span>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <p className="px-8 py-10 text-center text-sm text-brand-dark/70 dark:text-brand-light/80">
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
      <div className="w-full max-w-3xl rounded-[36px] border border-brand-primary/30 bg-white p-8 text-brand-dark shadow-[0_25px_120px_rgba(15,23,42,0.18)] dark:border-brand-primary/40 dark:bg-slate-900 dark:text-brand-light dark:shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">Create Product</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
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
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-lg focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
            </FormField>
            <FormField label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-full border border-brand-primary/40 bg-transparent px-4 py-2 text-sm focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
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
                  className="flex-1 rounded-full border border-brand-primary/40 bg-transparent px-3 py-2 text-sm focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
                <button type="button" onClick={handleAddCategory} className="rounded-full border border-brand-primary/40 px-4 py-2 text-sm font-semibold">
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
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-lg focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
              <p className="mt-1 text-xs text-brand-dark/60 dark:text-brand-light/80">Shown as Rs value inside the catalog.</p>
            </FormField>
            <FormField label="Purchase Price">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-lg focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
            </FormField>
          </div>
          <div className="rounded-3xl border border-brand-primary/40 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-dark/70 dark:text-brand-light/80">Upload image</p>
            <p className="mt-2 text-xs text-brand-dark/60 dark:text-brand-light/70">Optional reference render</p>
            <label className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/60 px-5 py-2 text-sm font-semibold">
              <UploadCloud className="h-4 w-4" />
              <input type="file" className="hidden" accept="image/*" />
              Attach File
            </label>
          </div>
          <p className="text-xs text-brand-dark/60 dark:text-brand-light/70">
            *Category can be created and saved on the fly (many-to-one). All product creations flow through this dialog to keep master data curated.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-primary dark:bg-brand-primary/30 dark:text-brand-light">
              Create
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 dark:text-brand-light/80">
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
    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/70 dark:text-brand-light/80">
      {label}
      <div className="mt-1 space-y-2">{children}</div>
    </label>
  );
}

function formatPrice(value: number) {
  return `${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Rs`;
}
