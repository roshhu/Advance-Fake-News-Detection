"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",          label: "Detector"  },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history",   label: "History"   },
] as const;

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0d1220]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#0099ff] text-[11px] font-bold text-black select-none transition-transform group-hover:scale-105">
            FN
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-white">
            Fake<span className="text-[#00d4aa]">Lens</span>
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  active
                    ? "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
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
