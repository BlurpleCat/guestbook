"use client";

import { useState, useEffect } from "react";

interface GuestbookEntry {
  sk: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export default function Home() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/guestbook");
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data = await res.json();
      setEntries(data);
    } catch {
      console.error("Could not load guestbook entries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both your first and last name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign guestbook");
      }

      setFirstName("");
      setLastName("");
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2">
          Guestbook
        </h1>
        <p className="text-center text-foreground/60 mb-10">
          You&apos;re here! Sign the guestbook!
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <input
            type="text"
            placeholder="First name"
            aria-label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-1 rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30"
          />
          <input
            type="text"
            placeholder="Last name"
            aria-label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="flex-1 rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Signing..." : "Sign"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm text-center mb-6" role="alert">
            {error}
          </p>
        )}

        <div className="border-t border-foreground/10 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50 mb-4">
            Recent Signatures
          </h2>

          {loading ? (
            <p className="text-foreground/40 text-sm">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-foreground/40 text-sm italic">
              No entries yet. Be the first to sign!
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.sk}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="font-medium">
                    {entry.firstName} {entry.lastName}
                  </span>
                  <span className="text-xs text-foreground/40 shrink-0">
                    {mounted ? formatDate(entry.createdAt) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
