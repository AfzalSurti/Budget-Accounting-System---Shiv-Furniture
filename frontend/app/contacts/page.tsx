"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { type ReactNode, useMemo, useState } from "react";
import { Mail, MapPin, Phone, Plus, UploadCloud, X } from "lucide-react";

type ContactStatus = "new" | "confirm" | "archived";

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

interface ContactDraft extends Omit<ContactRecord, "id" | "status"> {}

const DEFAULT_TAGS = ["B2B", "MSME", "Retailer", "Local"];

const INITIAL_CONTACTS: ContactRecord[] = [
  {
    id: "CON001",
    name: "Bharat Industries Pvt. Ltd.",
    email: "contact@bharatindustries.in",
    phone: "+91 98765 43210",
    address: {
      street: "12 Industrial Area",
      city: "Pune",
      state: "MH",
      country: "India",
      postalCode: "411001",
    },
    tags: ["B2B", "MSME"],
    status: "confirm",
  },
  {
    id: "CON002",
    name: "Sharma Traders",
    email: "purchase@sharmatraders.in",
    phone: "+91 91234 56789",
    address: {
      street: "7 MG Road",
      city: "Bengaluru",
      state: "KA",
      country: "India",
      postalCode: "560001",
    },
    tags: ["Retailer"],
    status: "new",
  },
  {
    id: "CON003",
    name: "Kolkata Retail Hub",
    email: "accounts@kolkataretail.in",
    phone: "+91 99876 54321",
    address: {
      street: "88 Park Street",
      city: "Kolkata",
      state: "WB",
      country: "India",
      postalCode: "700016",
    },
    tags: ["Local", "Retailer"],
    status: "confirm",
  },
  {
    id: "CON004",
    name: "Delhi Tech Solutions",
    email: "billing@delhitech.in",
    phone: "+91 90123 45678",
    address: {
      street: "59 Nehru Place",
      city: "New Delhi",
      state: "DL",
      country: "India",
      postalCode: "110019",
    },
    tags: ["B2B"],
    status: "archived",
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>(INITIAL_CONTACTS);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredContacts = useMemo(() => contacts, [contacts]);

  const handleCreateContact = (draft: ContactDraft) => {
    const nextId = `CON${(contacts.length + 1).toString().padStart(3, "0")}`;
    const record: ContactRecord = {
      id: nextId,
      status: "confirm",
      ...draft,
    };
    setContacts((prev) => [...prev, record]);
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-[24px] border border-brand-primary/20 bg-white p-4 text-brand-dark shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-brand-primary/30 dark:bg-slate-900/95 dark:text-brand-light dark:shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-left text-2xl font-semibold text-brand-dark dark:text-brand-light">Contacts</h1>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-light dark:hover:bg-brand-primary/30"
            >
              <Plus className="h-4 w-4" />
              New Contact
            </button>
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
                    {`${contact.address.city}, ${contact.address.state} • ${contact.address.country}`}
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
        </section>
      </div>
      {dialogOpen && (
        <ContactDialog
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateContact}
        />
      )}
    </AppLayout>
  );
}

function ContactDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: ContactDraft) => void }) {
  const [form, setForm] = useState<ContactDraft>({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    tags: [],
    avatarLabel: "",
  });
  const [availableTags, setAvailableTags] = useState(DEFAULT_TAGS);
  const [tagDraft, setTagDraft] = useState("");

  const handleChange = (field: keyof ContactDraft, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof ContactDraft["address"], value: string) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const toggleTag = (tag: string) => {
    handleChange(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag]
    );
  };

  const handleAddTag = () => {
    const trimmed = tagDraft.trim();
    if (!trimmed) return;
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (!form.tags.includes(trimmed)) {
      handleChange("tags", [...form.tags, trimmed]);
    }
    setTagDraft("");
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
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-dark/70 dark:text-brand-light/80">Tags</div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      form.tags.includes(tag)
                        ? "border-brand-primary/60 bg-brand-primary/20 text-brand-primary dark:border-brand-light/80 dark:bg-brand-primary/30 dark:text-brand-light"
                        : "border-brand-primary/40 text-brand-dark/70 dark:text-brand-light/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  placeholder="Add new tag on the fly"
                  className="flex-1 rounded-full border border-brand-primary/40 bg-transparent px-3 py-2 text-sm focus:border-brand-primary focus:outline-none dark:focus:border-brand-light"
                />
                <button type="button" onClick={handleAddTag} className="rounded-full border border-brand-primary/40 px-4 py-2 text-sm font-semibold">
                  Save Tag
                </button>
              </div>
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
            <p className="text-xs text-brand-dark/60 dark:text-brand-light/70">
              *Tags can be created and saved on the fly (many-to-many). A contact can belong to multiple analytical segments.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex-1 rounded-full border border-brand-primary/60 bg-brand-primary/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-primary dark:bg-brand-primary/30 dark:text-brand-light"
              >
                Create
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-dark/70 dark:text-brand-light/80"
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
