"use client";

interface Word {
  word:      string;
  weight:    number;
  direction: "fake" | "real";
}

interface Props {
  text:  string;
  words: Word[];
}

const LEGEND = [
  { cls: "word-high-fake", label: "Strong FAKE"   },
  { cls: "word-mid-fake",  label: "Moderate FAKE" },
  { cls: "word-high-real", label: "Strong REAL"   },
  { cls: "word-mid-real",  label: "Moderate REAL" },
] as const;

export default function XAIHighlight({ text, words }: Props) {
  const map = new Map(words.map((w) => [w.word.toLowerCase(), w]));
  const parts = text.split(/(\s+)/);

  return (
    <div className="space-y-3">
      {/* Highlighted text */}
      <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
        <p className="font-mono text-[13px] leading-[2.2]">
          {parts.map((part, i) => {
            const clean = part.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const match = map.get(clean);

            if (!match) return <span key={i}>{part}</span>;

            const hi  = match.weight > 0.6;
            const cls = match.direction === "fake"
              ? (hi ? "word-high-fake" : "word-mid-fake")
              : (hi ? "word-high-real" : "word-mid-real");

            return (
              <span
                key={i}
                className={cls}
                title={`${match.direction.toUpperCase()} · ${Math.round(match.weight * 100)}%`}
              >
                {part}
              </span>
            );
          })}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {LEGEND.map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className={`${cls} text-[9px] px-1.5 py-px rounded`}>abc</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
