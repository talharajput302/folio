"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "@/lib/editorExtensions";
import Toolbar from "./Toolbar";
import ShareDialog from "./ShareDialog";
import Wordmark from "@/components/ui/Wordmark";
import { ArrowLeftIcon, ShareIcon, CheckIcon } from "@/components/ui/Icons";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function Editor({
  id,
  initialTitle,
  initialContent,
  role,
  ownerName,
}: {
  id: string;
  initialTitle: string;
  initialContent: string;
  role: "owner" | "editor";
  ownerName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: editorExtensions(),
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: { class: "max-w-none focus:outline-none" },
    },
    immediatelyRender: false,
  });

  const save = useCallback(
    async (nextTitle: string, content: string) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, content }),
        });
        if (!res.ok) throw new Error("save failed");
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [id],
  );

  const scheduleSave = useCallback(() => {
    if (!editor) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(title, editor.getHTML());
    }, 800);
  }, [editor, save, title]);

  useEffect(() => {
    if (!editor) return;
    editor.on("update", scheduleSave);
    return () => {
      editor.off("update", scheduleSave);
    };
  }, [editor, scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function onTitleChange(value: string) {
    setTitle(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(value, editor?.getHTML() ?? "");
    }, 800);
  }

  async function goBack() {
    // Flush any pending autosave and wait for it, so the dashboard reflects the
    // latest content. router.refresh() revalidates the server-rendered list so
    // the document appears in "recents" immediately (no manual refresh needed).
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (editor) await save(title, editor.getHTML());
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--canvas)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--ink)]"
            >
              <ArrowLeftIcon width={16} height={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="hidden text-[var(--faint)] sm:inline">
              <Wordmark size="sm" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator state={saveState} />
            {role === "owner" ? (
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ink)] px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <ShareIcon width={15} height={15} />
                Share
              </button>
            ) : (
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                Shared by {ownerName}
              </span>
            )}
          </div>
        </div>
        <Toolbar editor={editor} />
      </header>

      {/* Paper */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="min-h-[70vh] rounded-2xl border border-[var(--line)] bg-white px-8 py-10 paper-shadow sm:px-14 sm:py-14 animate-rise">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled document"
            className="w-full bg-transparent font-serif text-4xl font-bold leading-tight outline-none placeholder:text-[var(--faint)]"
            aria-label="Document title"
          />
          <div className="mt-6">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>

      {shareOpen && <ShareDialog documentId={id} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const map: Record<SaveState, { text: string; cls: string; icon: boolean }> = {
    idle: { text: "Saved", cls: "text-[var(--faint)]", icon: true },
    saving: { text: "Saving…", cls: "text-[var(--muted)]", icon: false },
    saved: { text: "Saved", cls: "text-[var(--muted)]", icon: true },
    error: { text: "Save failed", cls: "text-red-600", icon: false },
  };
  const { text, cls, icon } = map[state];
  return (
    <span className={`hidden items-center gap-1 text-xs sm:inline-flex ${cls}`}>
      {icon && <CheckIcon width={13} height={13} />}
      {text}
    </span>
  );
}
