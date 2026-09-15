"use client";

import { useMemo, useState } from "react";
import { sendLeadEmailAction } from "@/app/actions/records";
import { Spinner } from "@/components/spinner";
import type { Lead } from "@/data/examples";
import {
  buildLeadEmailHtml,
  defaultLeadEmailDraft,
} from "@/lib/lead-email";

type Props = {
  lead: Lead;
  disabled?: boolean;
  onBack: () => void;
  onSent: (lead: Lead) => void;
};

export function LeadEmailPanel({ lead, disabled = false, onBack, onSent }: Props) {
  const defaults = useMemo(
    () => defaultLeadEmailDraft({ name: lead.name }),
    [lead.name],
  );
  const [subject, setSubject] = useState(defaults.subject);
  const [intro, setIntro] = useState(defaults.intro);
  const [html, setHtml] = useState(() => buildLeadEmailHtml(defaults.intro));
  const [htmlEdited, setHtmlEdited] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fieldClass =
    "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400";
  const busy = disabled || sending;

  function changeIntro(value: string) {
    setIntro(value);
    if (!htmlEdited) setHtml(buildLeadEmailHtml(value));
  }

  function resetTemplate() {
    const next = defaultLeadEmailDraft(lead);
    setSubject(next.subject);
    setIntro(next.intro);
    setHtml(buildLeadEmailHtml(next.intro));
    setHtmlEdited(false);
    setError("");
  }

  async function send() {
    if (busy) return;
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!html.trim()) {
      setError("Email content is required.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const result = await sendLeadEmailAction({
        leadId: lead.id,
        subject,
        html,
        intro: htmlEdited ? undefined : intro,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSent(result.lead);
    } catch {
      setError("Could not send email. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
        <button
          type="button"
          onClick={onBack}
          disabled={sending}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
        >
          ← Back to lead
        </button>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
          To
        </p>
        <p className="mt-1 text-sm text-zinc-800">{lead.email}</p>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            disabled={busy}
            className={fieldClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Intro
          <textarea
            value={intro}
            onChange={(event) => changeIntro(event.target.value)}
            disabled={busy}
            className={`${fieldClass} min-h-32 resize-y`}
          />
        </label>
        {htmlEdited ? (
          <p className="mt-1 text-xs text-zinc-500">
            HTML was edited. Intro changes no longer update the preview until you
            reset.
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-700">Preview</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowHtml((open) => !open)}
              disabled={busy}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
            >
              {showHtml ? "Hide HTML" : "Edit HTML"}
            </button>
            <button
              type="button"
              onClick={resetTemplate}
              disabled={busy}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
            >
              Reset template
            </button>
          </div>
        </div>

        <iframe
          title="Email preview"
          srcDoc={html}
          className="mt-2 h-[420px] w-full rounded-lg border border-zinc-200 bg-[#efece6]"
        />

        {showHtml ? (
          <label className="mt-4 block text-sm font-medium text-zinc-700">
            HTML
            <textarea
              value={html}
              onChange={(event) => {
                setHtml(event.target.value);
                setHtmlEdited(true);
              }}
              disabled={busy}
              spellCheck={false}
              className={`${fieldClass} min-h-40 resize-y font-mono text-xs leading-relaxed`}
            />
          </label>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          disabled={sending}
          className="h-10 rounded-xl px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-70"
        >
          {sending ? <Spinner className="h-4 w-4 text-white" /> : null}
          {sending ? "Sending…" : "Send email"}
        </button>
      </div>
    </div>
  );
}
