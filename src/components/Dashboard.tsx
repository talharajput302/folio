"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PlusIcon, ImportIcon, TrashIcon, DocIcon } from "@/components/ui/Icons";

type OwnedDoc = { id: string; title: string; preview: string; updatedAt: string };
type SharedDoc = OwnedDoc & { role: string; ownerName: string };

export default function Dashboard({
  user,
  owned,
  shared,
}: {
  user: { name: string; email: string };
  owned: OwnedDoc[];
  shared: SharedDoc[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OwnedDoc | null>(null);

  async function createDoc() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      if (!res.ok) throw new Error("Could not create document.");
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
    }
  }

  async function uploadFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Import failed.");
      router.push(`/documents/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const doc = pendingDelete;
    if (!doc) return;
    setPendingDelete(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl">Your workspace</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Create a document, or bring one in from a text file.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)] disabled:opacity-50"
              title="Import a .txt or .md file"
            >
              <ImportIcon width={16} height={16} />
              Import
            </button>
            <button
              onClick={createDoc}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <PlusIcon width={16} height={16} />
              New document
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Section title="Documents you own">
          {owned.length === 0 ? (
            <EmptyState
              title="No documents yet"
              body="Your documents will appear here. Create your first one to get started."
            />
          ) : (
            <Grid>
              {owned.map((d) => (
                <DocCard
                  key={d.id}
                  doc={d}
                  footer={<EditedLabel iso={d.updatedAt} />}
                  onDelete={() => setPendingDelete(d)}
                />
              ))}
            </Grid>
          )}
        </Section>

        <Section title="Shared with you">
          {shared.length === 0 ? (
            <EmptyState
              title="Nothing shared yet"
              body="When a teammate shares a document with you, it shows up here."
            />
          ) : (
            <Grid>
              {shared.map((d) => (
                <DocCard
                  key={d.id}
                  doc={d}
                  footer={
                    <span className="flex items-center gap-1.5">
                      <Avatar name={d.ownerName} size={18} />
                      <span>{d.ownerName}</span>
                    </span>
                  }
                  badge="Shared"
                />
              ))}
            </Grid>
          )}
        </Section>
      </main>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete document?"
          body={`“${pendingDelete.title.trim() || "Untitled document"}” will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--faint)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function DocCard({
  doc,
  footer,
  badge,
  onDelete,
}: {
  doc: { id: string; title: string; preview: string };
  footer: React.ReactNode;
  badge?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="group relative flex h-44 flex-col rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--ink)]/30 paper-shadow">
      <a href={`/documents/${doc.id}`} className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug line-clamp-2">
            {doc.title.trim() || <span className="text-[var(--faint)]">Untitled document</span>}
          </h3>
          {badge && (
            <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
          {doc.preview || "Empty document"}
        </p>
        <div className="mt-3 flex items-center text-xs text-[var(--faint)]">{footer}</div>
      </a>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--faint)] opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label={`Delete ${doc.title}`}
          title="Delete"
        >
          <TrashIcon width={15} height={15} />
        </button>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--canvas)] text-[var(--faint)]">
        <DocIcon width={20} height={20} />
      </span>
      <h3 className="mt-3 font-medium text-[var(--ink)]">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}

// Dates depend on the viewer's locale/timezone, which differs between the server
// render and the client. We render the label only after mount so there is no
// hydration mismatch (and no flashed error).
function EditedLabel({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(
      new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso]);
  return <span suppressHydrationWarning>{label ? `Edited ${label}` : "Recently edited"}</span>;
}
