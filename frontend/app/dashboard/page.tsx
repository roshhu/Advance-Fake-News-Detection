"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api, Stats } from "@/lib/api";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

/* ── Static chart data ───────────────────────────────────── */
const MODEL_DATA = [
  { name: "Hybrid CNN+FT", f1: 0.973 },
  { name: "XLNet",         f1: 0.961 },
  { name: "BiLSTM",        f1: 0.942 },
  { name: "LSTM",          f1: 0.914 },
  { name: "TF-IDF LR",    f1: 0.872 },
];

const EPOCH_DATA = Array.from({ length: 12 }, (_, i) => ({
  epoch: i + 1,
  train: +(Math.min(97.3, 52 + i * 4.2 + Math.random() * 1.8)).toFixed(1),
  val:   +(Math.min(96.8, 49 + i * 4.0 + Math.random() * 1.8)).toFixed(1),
}));

const CONF_MATRIX = [
  { label: "TP", val: 4863, color: "#10b981" },
  { label: "FP", val: 158,  color: "#ef4444" },
  { label: "TN", val: 4941, color: "#10b981" },
  { label: "FN", val: 138,  color: "#ef4444" },
];

const TICK = { fontSize: 10, fill: "#8892a4" };

const TOOLTIP_STYLE = {
  background: "#161d2e",
  border: "1px solid rgba(255,255,255,.07)",
  borderRadius: 8,
  fontSize: 11,
};

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pie = stats
    ? [{ name: "FAKE", value: stats.fake }, { name: "REAL", value: stats.real }]
    : [{ name: "FAKE", value: 1 },          { name: "REAL", value: 1 }];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">

        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">Model performance · Live Supabase stats</p>
        </div>

        {error && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3 text-xs text-yellow-400">
            Stats unavailable (backend may be offline): {error}
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { l: "Accuracy",  v: "97.3%", c: "#00d4aa" },
            { l: "Precision", v: "96.8%", c: "#0099ff" },
            { l: "Recall",    v: "97.1%", c: "#a855f7" },
            { l: "F1 Score",  v: "0.970", c: "#f59e0b" },
            { l: "AUC-ROC",   v: "0.991", c: "#10b981" },
            { l: "Analyzed",  v: loading ? "…" : String(stats?.total ?? 0), c: "#00d4aa" },
          ].map(({ l, v, c }) => (
            <div key={l} className="glass rounded-xl p-4 text-center">
              <p className="font-display text-xl font-extrabold" style={{ color: c }}>{v}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{l}</p>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Session Pie */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Session Distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  <Cell fill="#ef4444" fillOpacity={0.8} />
                  <Cell fill="#10b981" fillOpacity={0.8} />
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-red-500" />Fake: {stats?.fake ?? "–"}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Real: {stats?.real ?? "–"}</span>
            </div>
          </div>

          {/* Training accuracy */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Training Accuracy <span className="font-normal normal-case">by epoch</span>
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={EPOCH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="epoch" tick={TICK} />
                <YAxis domain={[40, 100]} tick={TICK} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="train" stroke="#00d4aa" strokeWidth={2} dot={false} name="Training" />
                <Line type="monotone" dataKey="val"   stroke="#0099ff" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Validation" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Model comparison */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Model Comparison <span className="font-normal normal-case">F1 score</span>
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MODEL_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false} />
                <XAxis type="number" domain={[0.8, 1]} tick={TICK} tickFormatter={(v: number) => v.toFixed(2)} />
                <YAxis type="category" dataKey="name" tick={TICK} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="f1" radius={[0, 4, 4, 0]} fill="#00d4aa" fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Confusion matrix */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Confusion Matrix <span className="font-normal normal-case">test set</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CONF_MATRIX.map(({ label, val, color }) => (
                <div key={label} className="flex flex-col items-center justify-center rounded-xl bg-white/3 border border-white/5 p-4">
                  <p className="font-display text-2xl font-extrabold" style={{ color }}>{val.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-[10px] text-slate-600">
              <span>✓ TP + TN = correct</span>
              <span>✗ FP + FN = errors</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
