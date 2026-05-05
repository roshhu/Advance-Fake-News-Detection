"use client";
import XAIHighlight from "./XAIHighlight";

interface Word {
  word:      string;
  weight:    number;
  direction: "fake" | "real";
}

interface Result {
  prediction:        "FAKE" | "REAL";
  confidence:        number;
  fake_prob:         number;
  real_prob:         number;
  risk_score:        string;
  sentiment:         string;
  explanation:       string;
  explanation_words: Word[];
  text_preview:      string;
  matrix_badge?:     string;
  latency_ms?:       number;
  db_saved?:         boolean;
}

interface Props {
  result:    Result;
  inputText: string;
}

const RISK_STYLE: Record<string, string> = {
  CRITICAL: "text-red-400 border-red-500/30 bg-red-500/10",
  HIGH:     "text-orange-400 border-orange-500/30 bg-orange-500/10",
  MEDIUM:   "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  LOW:      "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

export default function ResultCard({ result, inputText }: Props) {
  const isFake  = result.prediction === "FAKE";
  const confPct = Math.round(result.confidence * 100);
  const fakePct = Math.round(result.fake_prob  * 100);
  const realPct = Math.round(result.real_prob  * 100);
  const riskStyle = RISK_STYLE[result.risk_score] ?? RISK_STYLE.LOW;

  return (
    <div className="animate-slide-up space-y-4">

      {/* Verdict */}
      <div className="glass rounded-xl p-4 flex items-center gap-4">
        <div>
          <span className={`inline-block rounded-full px-4 py-1 text-sm font-bold font-display border ${
            isFake
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          }`}>
            {isFake ? "⚠ FAKE" : "✓ REAL"}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">ML Prediction</p>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-[15px] text-white">{confPct}% Confidence</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {result.latency_ms ? `${result.latency_ms}ms · ` : ""}TF-IDF + Logistic Regression
          </p>
        </div>
        <span className={`text-[10px] font-bold border rounded-full px-3 py-1 ${riskStyle}`}>
          {result.risk_score}
        </span>
      </div>

      {/* Probability bars */}
      <div className="glass rounded-xl p-4 space-y-3">
        {[
          { label: "Fake probability", pct: fakePct, grad: "from-red-500 to-rose-400",     color: "text-red-400"     },
          { label: "Real probability", pct: realPct, grad: "from-emerald-500 to-teal-400", color: "text-emerald-400" },
        ].map(({ label, pct, grad, color }) => (
          <div key={label}>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-400">{label}</span>
              <span className={`${color} font-bold`}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Metric pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Confidence", val: `${confPct}%`,    color: "text-[#00d4aa]" },
          { label: "Risk",        val: result.risk_score, color: riskStyle.split(" ")[0] },
          { label: "Tone",        val: result.sentiment,  color: "text-[#0099ff]" },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass rounded-xl p-3 text-center">
            <p className={`font-display font-bold text-sm ${color}`}>{val}</p>
            <p className="text-[10px] text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Confusion badge */}
      {result.matrix_badge && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confusion:</span>
          <span className="text-[11px] font-bold text-[#00d4aa]">{result.matrix_badge}</span>
        </div>
      )}

      {/* XAI */}
      {result.explanation_words.length > 0 && (
        <div className="glass rounded-xl p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">XAI · Influential Words</p>
          <XAIHighlight text={inputText.slice(0, 400)} words={result.explanation_words} />

          <div className="pt-2 space-y-2">
            {result.explanation_words.slice(0, 7).map((w) => {
              const pct  = Math.round(w.weight * 100);
              const fake = w.direction === "fake";
              return (
                <div key={w.word} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 text-right text-slate-400 truncate">{w.word}</span>
                  <div className="flex-1 h-3.5 rounded bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded flex items-center px-1.5 text-[9px] font-bold text-black transition-all duration-700 ${
                        fake ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 28 ? `${pct}%` : ""}
                    </div>
                  </div>
                  <span className="w-8 text-right text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-3">
            <span className="text-white font-bold">Reasoning: </span>{result.explanation}
          </p>
        </div>
      )}

      {result.db_saved === false && (
        <p className="text-[10px] text-yellow-500/70 text-right">⚠ Not saved to database</p>
      )}
    </div>
  );
}
