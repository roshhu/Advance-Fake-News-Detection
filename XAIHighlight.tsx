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

export default function XAIHighlight({ text, words }: Props) {
  const map = new Map(words.map((w) => [w.word.toLowerCase(), w]));
  const parts = text.split(/(\s+)/);

  return (
    <div>
      <p className="font-mono text-[13px] leading-[2.2] bg-[#111827] rounded-xl p-4 border border-white/5">
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
              title={`${match.direction.toUpperCase()} signal · ${Math.round(match.weight * 100)}%`}
            >
              {part}
            </span>
          );
        })}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-500">
        {[
          { cls: "word-high-fake", label: "Strong FAKE"    },
          { cls: "word-mid-fake",  label: "Moderate FAKE"  },
          { cls: "word-high-real", label: "Strong REAL"    },
          { cls: "word-mid-real",  label: "Moderate REAL"  },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`${cls} text-[9px] px-1.5 py-0 rounded`}>abc</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
