"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClickSpark from "@/components/reactbits/ClickSpark";
import Wordmark from "@/components/ui/Wordmark";
import { CheckIcon, DotIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { APP_TAGLINE } from "@/lib/brand";

type Mode = "login" | "signup";

// Password rules — kept in sync with passwordSchema on the server.
function passwordChecks(password: string) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "An uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "A lowercase letter", ok: /[a-z]/.test(password) },
    { label: "A number", ok: /[0-9]/.test(password) },
  ];
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = passwordChecks(password);
  const passwordValid = checks.every((c) => c.ok);
  const canSubmit =
    !loading &&
    (mode === "login"
      ? email.length > 0 && password.length > 0
      : name.trim().length > 0 && email.length > 0 && passwordValid);

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <ClickSpark sparkColor="#8b7fff" sparkCount={10} sparkRadius={22} duration={520}>
      <main className="min-h-screen w-full md:grid md:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden md:flex flex-col justify-between bg-[var(--ink)] p-12 text-white overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative z-10 text-white">
            <Wordmark size="md" />
          </div>
          <div className="relative z-10 max-w-sm">
            <h1 className="font-serif text-4xl leading-tight">
              A calm place to write, together.
            </h1>
            <p className="mt-4 text-white/60 leading-relaxed">
              Draft documents, format them cleanly, and share with exactly the
              people you choose. Nothing more than you need.
            </p>
          </div>
          <div className="relative z-10 text-sm text-white/40">{APP_TAGLINE}</div>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm animate-rise">
            <div className="md:hidden mb-8">
              <Wordmark size="md" />
            </div>

            <h2 className="font-serif text-3xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {mode === "login"
                ? "Sign in to continue to your documents."
                : "Start writing and sharing in seconds."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <Field
                  label="Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="Jordan Lee"
                  autoComplete="name"
                />
              )}
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
                autoComplete="email"
              />

              {/* Password with show/hide */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Create a strong password" : "••••••••"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 pr-11 text-sm outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--ink)]"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon width={17} height={17} /> : <EyeIcon width={17} height={17} />}
                  </button>
                </div>
              </label>

              {/* Live password checklist (signup only) */}
              {mode === "signup" && (
                <ul className="space-y-1.5 rounded-xl bg-black/[0.03] p-3">
                  {checks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-center gap-2 text-xs transition ${
                        c.ok ? "text-green-700" : "text-[var(--faint)]"
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                          c.ok ? "bg-green-600 text-white" : "bg-[var(--line)] text-[var(--faint)]"
                        }`}
                      >
                        {c.ok ? <CheckIcon width={10} height={10} /> : <DotIcon width={8} height={8} />}
                      </span>
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-[var(--muted)]">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button
                onClick={switchMode}
                className="font-medium text-[var(--ink)] underline underline-offset-4 hover:text-[var(--accent)]"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </section>
      </main>
    </ClickSpark>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--ink)]/10"
      />
    </label>
  );
}
