/* ── Base URL ─────────────────────────────────────────────── */
const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://advance-fake-news-detection.onrender.com";

/* ── Types ───────────────────────────────────────────────── */
export interface WordScore {
  word:      string;
  score:     number;           // 0-1 normalised
  direction: "fake" | "real";
}

export interface PredictResponse {
  id?:         string;
  prediction:  "FAKE" | "REAL";
  confidence:  number;         // probability of predicted class
  fake_prob:   number;
  real_prob:   number;
  explanation: WordScore[];
  latency_ms?: number;
  db_saved?:   boolean;
  // optional field some backend versions return
  tp_tn_fp_fn?: string;
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

export interface MappedResult {
  prediction:        "FAKE" | "REAL";
  confidence:        number;
  fake_prob:         number;
  real_prob:         number;
  risk_score:        "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  sentiment:         "ALARMIST" | "NEUTRAL";
  explanation:       string;
  explanation_words: Array<{ word: string; weight: number; direction: "fake" | "real" }>;
  text_preview:      string;
  matrix_badge?:     string;
  latency_ms?:       number;
  db_saved?:         boolean;
}

/* ── Core fetch wrapper ──────────────────────────────────── */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch (_) { /* ignore parse errors */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

/* ── Public API ──────────────────────────────────────────── */
export const api = {
  predict: (text: string) =>
    apiFetch<PredictResponse>("/predict", {
      method: "POST",
      body:   JSON.stringify({ text }),
    }),

  history: (limit = 50) =>
    apiFetch<HistoryItem[]>(`/history?limit=${limit}`),

  stats: () =>
    apiFetch<Stats>("/stats"),
};

/* ── mapResponse ─────────────────────────────────────────── */
// Canonical normalisation: backend → UI shape
// (Final version — deduped words, .toFixed(3), null-safe)
export function mapResponse(
  data: PredictResponse,
  originalText: string,
): MappedResult {
  const prediction = (data.prediction ?? "").toUpperCase() as "FAKE" | "REAL";
  const isFake     = prediction === "FAKE";

  const conf    = Math.min(Math.max(data.confidence ?? 0, 0), 1);
  const fakePct = isFake ? conf : 1 - conf;
  const realPct = isFake ? 1 - conf : conf;

  // Confusion matrix badge (optional backend field)
  const matrixBadge = data.tp_tn_fp_fn
    ? `Case: ${data.tp_tn_fp_fn}`
    : undefined;

  // Deduplicated, normalised word list
  const seen = new Set<string>();
  const words = (data.explanation ?? [])
    .map((w) => ({
      word:      String(w.word ?? "").toLowerCase(),
      weight:    Math.min(Math.max(w.score ?? 0, 0), 1),
      direction: (w.direction === "real" ? "real" : "fake") as "fake" | "real",
    }))
    .filter((w) => w.word && !seen.has(w.word) && seen.add(w.word));

  // Risk band
  const risk: MappedResult["risk_score"] =
    fakePct > 0.85 ? "CRITICAL" :
    fakePct > 0.65 ? "HIGH"     :
    fakePct > 0.40 ? "MEDIUM"   : "LOW";

  // Human-readable reasoning
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
    prediction:        prediction || "REAL",
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
