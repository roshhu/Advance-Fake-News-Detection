const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://advance-fake-news-detection.onrender.com";

/* ── Types ───────────────────────────────────────────────── */
export interface WordScore {
  word:      string;
  score:     number;
  direction: "fake" | "real";
}

export interface PredictResponse {
  id?:         string;
  prediction:  "FAKE" | "REAL";
  confidence:  number;
  fake_prob:   number;
  real_prob:   number;
  explanation: WordScore[];
  latency_ms?: number;
  db_saved?:   boolean;
}

export interface HistoryItem {
  id:         string;
  text:       string;
  prediction: "FAKE" | "REAL";
  confidence: number;
  created_at: string;
}

export interface Stats {
  total: number;
  fake:  number;
  real:  number;
}

/* ── Core fetch wrapper ──────────────────────────────────── */
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json()).detail ?? detail; } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

/* ── API methods ─────────────────────────────────────────── */
export const api = {
  predict: (text: string) =>
    req<PredictResponse>("/predict", {
      method: "POST",
      body:   JSON.stringify({ text }),
    }),

  history: (limit = 50) =>
    req<HistoryItem[]>(`/history?limit=${limit}`),

  stats: () =>
    req<Stats>("/stats"),
};

/* ── mapResponse — normalise backend → UI shape ─────────── */
export function mapResponse(data: PredictResponse, originalText: string) {
  const prediction = (data.prediction ?? "").toUpperCase() as "FAKE" | "REAL";
  const isFake     = prediction === "FAKE";
  const conf       = Math.min(Math.max(data.confidence ?? 0, 0), 1);
  const fakePct    = isFake ? conf : 1 - conf;
  const realPct    = isFake ? 1 - conf : conf;
  const matrixBadge = (data as any).tp_tn_fp_fn ? `Case: ${(data as any).tp_tn_fp_fn}` : undefined;
  const risk        = fakePct > 0.85 ? "CRITICAL" : fakePct > 0.65 ? "HIGH" : fakePct > 0.40 ? "MEDIUM" : "LOW";

  const seen  = new Set<string>();
  const words = (data.explanation ?? [])
    .map((w) => ({
      word:      String(w.word ?? "").toLowerCase(),
      weight:    Math.min(Math.max(w.score ?? 0, 0), 1),
      direction: (w.direction === "real" ? "real" : "fake") as "fake" | "real",
    }))
    .filter((w) => w.word && !seen.has(w.word) && seen.add(w.word));

  const topFk = words.filter((w) => w.direction === "fake").slice(0, 3).map((w) => w.word);
  const topRl = words.filter((w) => w.direction === "real").slice(0, 3).map((w) => w.word);

  const explanation = isFake
    ? `Classified FAKE (${Math.round(fakePct * 100)}% confidence).` +
      (topFk.length ? ` Key signals: "${topFk.join('", "')}".` : "") +
      " Sensational or unverifiable language detected."
    : `Classified REAL (${Math.round(realPct * 100)}% confidence).` +
      (topRl.length ? ` Credibility signals: "${topRl.join('", "')}".` : "") +
      " Measured, factual language detected.";

  return {
    prediction,
    confidence:        Number(conf.toFixed(3)),
    fake_prob:         Number(fakePct.toFixed(3)),
    real_prob:         Number(realPct.toFixed(3)),
    risk_score:        risk,
    sentiment:         isFake ? "ALARMIST" : "NEUTRAL",
    explanation,
    explanation_words: words,
    text_preview:      String(originalText ?? "").slice(0, 400),
    matrix_badge:      matrixBadge,
    latency_ms:        data.latency_ms,
    db_saved:          data.db_saved,
  };
}
