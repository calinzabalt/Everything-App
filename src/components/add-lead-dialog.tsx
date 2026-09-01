"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spinner } from "@/components/spinner";
import type { Lead } from "@/data/examples";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void | Promise<void>;
};

export function AddLeadDialog({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPhone("");
    setUrl("");
    setLocation("");
    setCountry("");
    setSource("");
    setNote("");
    setError("");
    setSaving(false);
    const id = window.setTimeout(() => nameRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, saving]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const business = name.trim();
    if (!business) {
      setError("Business name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onAdd({
        id: `lead-${Date.now()}`,
        name: business,
        email: email.trim(),
        phone: phone.trim(),
        url: url.trim(),
        location: location.trim(),
        country: country.trim(),
        note: note.trim(),
        source: source.trim() || "Manual",
        status: "new",
      });
    } catch {
      setError("Could not save. Try again.");
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-950/40 animate-fade-in"
        onClick={() => !saving && onClose()}
        disabled={saving}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl animate-dialog-in"
      >
        <h2 id="add-lead-title" className="text-lg font-semibold text-zinc-950">
          Add lead
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Business name is required. Everything else is optional.
        </p>

        <form className="mt-5 grid gap-3" onSubmit={submit}>
          <label className="text-sm font-medium text-zinc-700">
            Business name <span className="text-sky-600">*</span>
            <input
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
              placeholder="Panificație Mureș"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
                placeholder="hello@example.com"
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={fieldClass}
                placeholder="+44 7xxx xxx xxx"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-zinc-700">
            Contact page
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={fieldClass}
              placeholder="https://example.com/contact"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Location
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Country
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="text-sm font-medium text-zinc-700">
            Source
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={fieldClass}
              placeholder="Google Maps"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={`${fieldClass} min-h-20 resize-y`}
              placeholder="No website. Local bakery."
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-70"
            >
              {saving ? <Spinner className="h-4 w-4 text-white" /> : null}
              {saving ? "Saving…" : "Save lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
