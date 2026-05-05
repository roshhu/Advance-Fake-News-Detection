"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",          label: "Detector"  },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history",   label: "History"   },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 bg-[#0d1220]/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-[11px] font-bold text-black font-display select-none">
            FN
          </div>
          <span className="font-display text-sm font-bold tracking-tight">
            Fake<span className="text-accent">Lens</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex gap-1">
          {NAV.map(({ href, label }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs transition-all duration-200",
                  active
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
