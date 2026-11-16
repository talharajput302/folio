"use client";

import { useRouter } from "next/navigation";
import Wordmark from "./Wordmark";
import Avatar from "./Avatar";
import { LogOutIcon } from "./Icons";

export default function Header({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--canvas)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <Wordmark size="sm" />
        </a>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar name={user.name} size={30} />
            <span className="text-sm text-[var(--muted)]">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--ink)]"
            title="Sign out"
          >
            <LogOutIcon width={16} height={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
