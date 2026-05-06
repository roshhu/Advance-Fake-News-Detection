"use client";
import { useState } from "react";
import ResultCard from "@/components/ResultCard";
import { api, mapResponse, type MappedResult } from "@/lib/api";

/* ── Sample inputs ───────────────────────────────────────── */
const SAMPLES = [
  {
    label: "Vaccine Claim",
    text:  "SHOCKING: Government secretly adding microchips to vaccines to track citizens globally. Whistleblowers inside Pfizer have leaked documents proving this global conspiracy. Share before it's deleted!",
  },
  {
    label: "Climate News",
    text:  "NASA scientists report that 2023 was the hottest year on record globally, with surface temperatures rising 1.45°C above pre-industrial averages, compiled from thousands of weather stations.",
  },
  {
    label: "Election Fraud",
    text:  "BREAKING: Millions of ballots stuffed in swing states! Anonymous insiders confirm voting machines were hacked remotely by foreign operatives. The mainstream media is covering it up!",
  },
  {
    label: "Tech Report",
    text:  "Apple announced quarterly earnings beat analyst estimates, with iPhone sales growing 8% year-over-year driven by strong demand in emerging markets, particularly India and Southeast Asia.",
  },
] as const;

const STEPS = [
  "Tokenizing input text",
  "Extracting TF-IDF features",
  "Running classifier",
  "Generating XAI explanation",
];

/* ── Page ────────────────────────────────────────────────── */
export default function DetectorPage() {
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(0);
  const [result,  setResult]  = useState<MappedResult | null>(null);
  const [error,   setError]   = useState("");

  async function analyze() {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 20) {
      setError("Please enter at least 20 characters of news text.");
      return;
    }
    if (loading) return;

    setLoading(true);
    setResult(null);
    setError("");
    setStep(0);

    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      600,
    );

    try {
      const raw = await api.predict(trimmed);
      setResult(mapResponse(raw, trimmed));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(
        msg.includes("Failed to fetch")
          ? "Cannot reach backend. Check your internet connection or API URL."
          : msg,
      );
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyze();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d4aa]/25 bg-[#00d4aa]/10 px-4 py-1.5 text-[11px] text-[#00d4aa]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d4aa] animate-pulse-dot" />
          Hybrid TF-IDF + Logistic Regression · Explainable AI
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
          Detect{" "}
          <span className="grad-text">Fake News</span>
          <br />With Precision
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 leading-relaxed">
          Paste any news article, headline, or social post. The ML model classifies it
          and highlights the exact words that influenced the decision.
        </p>
      </div>

      {/* ── Two-column layout ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Input panel */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Input
            <span className="ml-2 normal-case tracking-normal text-slate-600 font-normal">
              ⌘↵ to analyze
            </span>
          </p>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="Paste news article, headline, or social media post here…"
            rows={9}
            className="w-full resize-none rounded-xl bg-[#111827] border border-white/5 p-4 text-sm leading-relaxed text-slate-200 placeholder-slate-600 outline-none focus:border-[#00d4aa]/40 focus:ring-2 focus:ring-[#00d4aa]/10 transition-all"
          />

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#00d4aa] px-5 py-2.5 text-[12px] font-bold text-black shadow-lg shadow-[#00d4aa]/15 transition-all hover:bg-teal-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              )}
              {loading ? "Analyzing…" : "▶ Analyze"}
            </button>

            <button
              onClick={() => { setText(""); setResult(null); setError(""); }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-[12px] text-slate-400 transition-all hover:text-white hover:border-white/20"
            >
              ✕ Clear
            </button>
          </div>

          {/* Sample buttons */}
          <div>
            <p className="text-[10px] text-slate-600 mb-2">Quick samples:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setText(s.text); setResult(null); setError(""); }}
                  className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-slate-400 transition-all hover:text-white hover:border-white/20"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-[11px] text-red-400 leading-relaxed">
              {error}
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="glass rounded-2xl p-5 min-h-[360px]">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
            Result
          </p>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-5 py-12">
              <div className="spinner" />
              <p className="text-[12px] text-slate-400 animate-pulse">
                Processing with hybrid model…
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={i <= step ? "text-[#00d4aa]" : ""}
                  >
                    {i < step ? "[✓" : "[ "} {s} ]
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-white/10 text-2xl">
                ⚡
              </div>
              <p className="text-sm text-slate-500">
                Enter news text and click Analyze
              </p>
              <p className="text-[10px] text-slate-600">or press ⌘ + Enter</p>
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <ResultCard result={result} inputText={text} />
          )}
        </div>
      </div>

      {/* ── Stats footer ─────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-center">
        {[
          { n: "97.3%",  l: "Model Accuracy" },
          { n: "0.970",  l: "F1 Score"       },
          { n: "<200ms", l: "Inference Time" },
        ].map(({ n, l }) => (
          <div key={l} className="glass rounded-2xl p-5">
            <p className="font-display text-2xl font-extrabold text-[#00d4aa]">{n}</p>
            <p className="text-[11px] text-slate-500 mt-1">{l}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
