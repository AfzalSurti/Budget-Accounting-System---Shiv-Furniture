"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet, apiPost } from "@/lib/api";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Download, Mail, MapPin, Phone, Plus, UploadCloud, X } from "lucide-react";
import { exportTableToPDF } from "@/lib/pdf-utils";

type ContactStatus = "new" | "confirm" | "archived";

type ContactType = "customer" | "vendor" | "both" | "internal";

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  tags: string[];
  status: ContactStatus;
  avatarLabel?: string;
}

interface ContactDraft extends Omit<ContactRecord, "id" | "status" | "tags"> {
  contactType: ContactType;
  partnerTags: string;
}

interface BackendContact {
  id: string;
  contactType: ContactType;
  displayName: string;
  email: string | null;
  phone: string | null;
  billingAddress?: unknown;
  shippingAddress?: unknown;
  isActive: boolean;
  contactTags?: Array<{ tag: { name: string } }>;
}

const EMPTY_ADDRESS = {
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

const toAddress = (value: unknown): ContactRecord["address"] => {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_ADDRESS };
  }
  const address = value as Record<string, unknown>;
  return {
    street: typeof address.street === "string" ? address.street : "",
    city: typeof address.city === "string" ? address.city : "",
    state: typeof address.state === "string" ? address.state : "",
    country: typeof address.country === "string" ? address.country : "",
    postalCode: typeof address.postalCode === "string" ? address.postalCode : "",
  };
};

const toTagLabels = (contactType: ContactType): string[] => {
  switch (contactType) {
    case "both":
      return ["Customer", "Vendor"];
    case "customer":
      return ["Customer"];
    case "vendor":
      return ["Vendor"];
    case "internal":
      return ["Internal"];
    default:
      return [];
  }
};

const mapContact = (contact: BackendContact): ContactRecord => {
  const addressSource = contact.billingAddress ?? contact.shippingAddress;
  const partnerTags = contact.contactTags?.map((item) => item.tag.name) ?? [];
  return {
    id: contact.id,
    name: contact.displayName,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    address: toAddress(addressSource),
    tags: [...toTagLabels(contact.contactType), ...partnerTags],
    status: contact.isActive ? "confirm" : "archived",
  };
};

const buildAddressPayload = (address: ContactRecord["address"]) => {
  const hasAnyValue = Object.values(address).some((value) => value.trim().length > 0);
  return hasAnyValue ? { ...address } : null;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredContacts = useMemo(() => contacts, [contacts]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<BackendContact[]>(
        `/contacts?companyId=${DEFAULT_COMPANY_ID}`,
      );
      setContacts((data ?? []).map(mapContact));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load contacts";
      console.error("Failed to load contacts:", loadError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleCreateContact = async (draft: ContactDraft) => {
    setIsSaving(true);
    setError(null);
    const addressPayload = buildAddressPayload(draft.address);
    try {
      await apiPost<BackendContact, Record<string, unknown>>("/contacts", {
        companyId: DEFAULT_COMPANY_ID,
        contactType: draft.contactType,
        displayName: draft.name,
        email: draft.email.trim() ? draft.email.trim() : null,
        phone: draft.phone.trim() ? draft.phone.trim() : null,
        billingAddress: addressPayload,
        shippingAddress: addressPayload,
        tags: draft.partnerTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      });
      await loadContacts();
      setDialogOpen(false);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Failed to create contact";
      console.error("Failed to create contact:", createError);
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    exportTableToPDF(
      "Contacts",
      [
        { header: "Name", key: "name" },
        { header: "Type", key: "type" },
        { header: "Email", key: "email" },
        { header: "Phone", key: "phone" },
        { header: "Status", key: "status" },
      ],
      filteredContacts.map((row) => ({
        name: row.name,
        type: row.tags.join(", "),
        email: row.email,
        phone: row.phone,
        status: row.status,
      })),
      "Contacts.pdf"
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[24px] border border-brand-primary/20 bg-white p-4 text-brand-dark shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-brand-primary/30 dark:bg-slate-900/95 dark:text-brand-light dark:shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-left text-2xl font-semibold text-brand-dark dark:text-brand-light">Contacts</h1>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-light dark:hover:bg-brand-primary/30"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button
                onClick={() => setDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-light dark:hover:bg-brand-primary/30"
              >
                <Plus className="h-4 w-4" />
                New Contact
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-[32px] border border-slate-200/40 bg-white/70 p-6 shadow-lg shadow-slate-200/40 dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Contacts ({filteredContacts.length})
            </h2>
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Click New to open the creation dialog
            </span>
          </div>
          {error && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {loading ? (
            <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              Loading contacts from the database...
            </p>
          ) : (
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <article
                  key={contact.id}
                  className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-brand-accent">{contact.id}</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{contact.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-brand-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary dark:border-brand-primary/40 dark:text-brand-light/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-brand-primary" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-primary" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                      {`${contact.address.city}, ${contact.address.state} - ${contact.address.country}`}
                    </div>
                  </div>
                </article>
              ))}
              {filteredContacts.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300/60 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  No contacts under this state yet. Use the New Contact dialog to create one.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
      {dialogOpen && (
        <ContactDialog
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateContact}
          isSaving={isSaving}
        />
      )}
    </AppLayout>
  );
}

function ContactDialog({
  onClose,
  onSubmit,
  isSaving,
}: {
  onClose: () => void;
  onSubmit: (draft: ContactDraft) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ContactDraft>({
    name: "",
    email: "",
    phone: "",
    contactType: "customer",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    avatarLabel: "",
    partnerTags: "",
  });

  const handleChange = (field: keyof ContactDraft, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof ContactDraft["address"], value: string) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-[36px] border border-brand-primary/30 bg-white p-8 text-brand-dark shadow-[0_25px_120px_rgba(15,23,42,0.18)] dark:border-brand-primary/40 dark:bg-slate-900 dark:text-brand-light dark:shadow-[0_25px_120px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between border-b border-brand-primary/20 pb-4">
          <h2 className="text-2xl font-semibold">Create Contact</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full border border-brand-primary/40 p-2 hover:bg-brand-primary/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <FormField label="Contact Name">
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 text-lg focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
            </FormField>
            <FormField label="Contact Type">
              <select
                value={form.contactType}
                onChange={(e) => handleChange("contactType", e.target.value as ContactType)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="both">Both</option>
                <option value="internal">Internal</option>
              </select>
            </FormField>
            <FormField label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
            </FormField>
            <FormField label="Phone">
              <input
                required
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
            </FormField>
            <FormField label="Partner Tags">
              <input
                value={form.partnerTags}
                onChange={(e) => handleChange("partnerTags", e.target.value)}
                placeholder="e.g. wholesale, priority"
                className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
              />
              <p className="mt-1 text-xs text-brand-dark/60 dark:text-brand-light/70">
                Comma-separated tags used for auto-analytical matching.
              </p>
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Street">
                <input
                  value={form.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
              </FormField>
              <FormField label="City">
                <input
                  value={form.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
              </FormField>
              <FormField label="State">
                <input
                  value={form.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
              </FormField>
              <FormField label="Country">
                <input
                  value={form.address.country}
                  onChange={(e) => handleAddressChange("country", e.target.value)}
                  className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
              </FormField>
              <FormField label="Pincode">
                <input
                  value={form.address.postalCode}
                  onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                  className="w-full border-b border-dashed border-brand-primary/60 bg-transparent px-1 py-2 focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
              </FormField>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-brand-primary/40 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70 dark:text-brand-light/80">Upload image</p>
              <p className="mt-2 text-xs text-brand-dark/60 dark:text-brand-light/70">PNG, JPG up to 5MB</p>
              <label className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/60 px-5 py-2 text-sm font-semibold">
                <UploadCloud className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleChange("avatarLabel", e.target.files?.[0]?.name ?? "")}
                />
                {form.avatarLabel ? form.avatarLabel : "Select File"}
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-primary/30 dark:text-brand-light"
              >
                {isSaving ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-light/80"
              >
                Cancel
              </button>
            </div>
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
      <div className="mt-1">{children}</div>
    </label>
  );
}

