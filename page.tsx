"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api, HistoryItem } from "@/lib/api";

export default function HistoryPage() {
  const [items,   setItems]   = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.history(50)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">

        <div className="mb-7">
          <h2 className="font-display text-2xl font-extrabold text-white">Prediction History</h2>
          <p className="text-xs text-slate-500 mt-1">
            All past predictions stored in Supabase · latest first
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3 text-xs text-yellow-400">
            Unable to fetch history: {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-24">
            <div className="spinner" />
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-sm text-slate-500">No predictions yet. Go analyze some news!</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_90px_75px_150px] gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
              <span>Article Text</span>
              <span className="text-center">Verdict</span>
              <span className="text-center">Confidence</span>
              <span className="text-right">Timestamp</span>
            </div>

            {/* Rows */}
            {items.map((item) => {
              const isFake = item.prediction === "FAKE";
              const conf   = Math.round(item.confidence * 100);
              const time   = new Date(item.created_at).toLocaleString(undefined, {
                month:  "short",
                day:    "numeric",
                hour:   "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_90px_75px_150px] gap-3 px-5 py-4 border-b border-white/5 hover:bg-white/2 transition-colors"
                >
                  <span className="text-[12px] text-slate-300 truncate pr-2">
                    {item.text}
                  </span>

                  <span className="flex items-center justify-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isFake
                        ? "bg-red-500/10 text-red-400 border-red-500/25"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    }`}>
                      {item.prediction}
                    </span>
                  </span>

                  <span className={`flex items-center justify-center text-[12px] font-bold ${
                    isFake ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {conf}%
                  </span>

                  <span className="flex items-center justify-end text-[11px] text-slate-500">
                    {time}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!loading && items.length > 0 && (
          <p className="mt-4 text-right text-[10px] text-slate-600">
            Showing {items.length} most recent predictions
          </p>
        )}
      </main>
    </>
  );
}
