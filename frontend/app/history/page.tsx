"use client";
import { useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://advance-fake-news-detection.onrender.com";

interface HistoryItem {
  id:         string;
  text:       string;
  prediction: "FAKE" | "REAL";
  confidence: number;
  created_at: string;
}

export default function HistoryPage() {
  const [items,   setItems]   = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`${BASE}/history?limit=50`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<HistoryItem[]>;
      })
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">

      {/* Header */}
      <div className="mb-7">
        <h2 className="font-display text-2xl font-extrabold text-white">
          Prediction History
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          All past predictions stored in Supabase · latest first
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-400">
          Unable to fetch history — backend may be offline: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="spinner" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <span className="text-5xl">📭</span>
          <p className="text-sm text-slate-500">No predictions yet. Go analyze some news!</p>
        </div>
      )}

      {/* Table */}
      {!loading && items.length > 0 && (
        <>
          <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
            {/* Head */}
            <div className="grid grid-cols-[1fr_90px_80px_160px] gap-3 border-b border-white/5 px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 min-w-[600px]">
              <span>Article Text</span>
              <span className="text-center">Verdict</span>
              <span className="text-center">Confidence</span>
              <span className="text-right">Timestamp</span>
            </div>

            {/* Scrollable rows */}
            <div className="max-h-[62vh] overflow-y-auto">
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
                    className="grid grid-cols-[1fr_90px_80px_160px] gap-3 border-b border-white/5 px-5 py-4 transition-colors hover:bg-white/2 min-w-[600px]"
                  >
                    <span className="truncate pr-2 text-[12px] text-slate-300">
                      {item.text}
                    </span>

                    <span className="flex items-center justify-center">
                      <span className={[
                        "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                        isFake
                          ? "bg-red-500/10 text-red-400 border-red-500/25"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
                      ].join(" ")}>
                        {item.prediction}
                      </span>
                    </span>

                    <span className={[
                      "flex items-center justify-center text-[12px] font-bold",
                      isFake ? "text-red-400" : "text-emerald-400",
                    ].join(" ")}>
                      {conf}%
                    </span>

                    <span className="flex items-center justify-end text-[11px] text-slate-500">
                      {time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-right text-[10px] text-slate-600">
            Showing {items.length} most recent predictions
          </p>
        </>
      )}
    </main>
  );
}
