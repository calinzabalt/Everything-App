"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spinner } from "@/components/spinner";
import type { Job } from "@/data/examples";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (job: Job) => void | Promise<void>;
};

export function AddJobDialog({ open, onClose, onAdd }: Props) {
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const roleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setRole("");
    setUrl("");
    setCompany("");
    setLocation("");
    setCountry("");
    setLevel("");
    setSkills("");
    setSource("");
    setError("");
    setSaving(false);
    const id = window.setTimeout(() => roleRef.current?.focus(), 0);
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
    const title = role.trim();
    const applyUrl = url.trim();
    if (!title || !applyUrl) {
      setError("Role and apply link are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onAdd({
        id: `job-${Date.now()}`,
        title,
        company: company.trim() || "—",
        location: location.trim(),
        country: country.trim(),
        level: level === "Senior" ? "Senior" : "Mid",
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        source: source.trim() || "Manual",
        url: applyUrl,
        status: "not_applied",
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
        aria-labelledby="add-job-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl animate-dialog-in"
      >
        <h2 id="add-job-title" className="text-lg font-semibold text-zinc-950">
          Add job
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Role and apply link are required. Everything else is optional.
        </p>

        <form className="mt-5 grid gap-3" onSubmit={submit}>
          <label className="text-sm font-medium text-zinc-700">
            Role <span className="text-sky-600">*</span>
            <input
              ref={roleRef}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={fieldClass}
              placeholder="Senior React Developer"
              required
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Apply link <span className="text-sky-600">*</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={fieldClass}
              placeholder="https://"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Company
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className={fieldClass}
              >
                <option value="">—</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </label>
          </div>

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
            Skills
            <input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              className={fieldClass}
              placeholder="React, TypeScript"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Source
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={fieldClass}
              placeholder="LinkedIn"
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
              {saving ? "Saving…" : "Save job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
