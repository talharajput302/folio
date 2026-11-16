"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { XIcon } from "@/components/ui/Icons";

type Collaborator = { userId: string; name: string; email: string; role: string };

export default function ShareDialog({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [owner, setOwner] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/documents/${documentId}/shares`);
    if (res.ok) {
      const data = await res.json();
      setOwner(data.owner);
      setCollaborators(data.collaborators);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  async function share(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not share.");
      setEmail("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userId: string) {
    setBusy(true);
    try {
      await fetch(`/api/documents/${documentId}/shares?userId=${userId}`, {
        method: "DELETE",
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 paper-shadow animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Share document</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--ink)]"
            aria-label="Close"
          >
            <XIcon width={18} height={18} />
          </button>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Invite someone by the email they signed up with.
        </p>

        <form onSubmit={share} className="mt-4 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="flex-1 rounded-xl border border-[var(--line)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ink)]"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Share
          </button>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--faint)]">
            People with access
          </h3>
          <ul className="mt-3 space-y-3">
            {owner && (
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Avatar name={owner.name} size={32} />
                  <span className="text-sm">
                    <span className="block font-medium">{owner.name}</span>
                    <span className="block text-xs text-[var(--muted)]">{owner.email}</span>
                  </span>
                </span>
                <span className="text-xs font-medium text-[var(--faint)]">Owner</span>
              </li>
            )}
            {collaborators.map((c) => (
              <li key={c.userId} className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Avatar name={c.name} size={32} />
                  <span className="text-sm">
                    <span className="block font-medium">{c.name}</span>
                    <span className="block text-xs text-[var(--muted)]">{c.email}</span>
                  </span>
                </span>
                <button
                  onClick={() => revoke(c.userId)}
                  disabled={busy}
                  className="text-xs text-[var(--muted)] transition hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
            {collaborators.length === 0 && (
              <li className="text-sm text-[var(--muted)]">Not shared with anyone yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
