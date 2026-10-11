"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#07090d] px-4 text-slate-100">
      <section className="max-w-md rounded-lg border border-white/10 bg-white/[0.035] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          InboxSignal
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Something went sideways
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The dashboard hit an unexpected error. Try reloading this view.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-5 h-10 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
