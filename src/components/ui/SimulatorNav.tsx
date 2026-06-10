"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const SIMULATORS = [
  { href: "/", labelKey: "navDcTab" },
  { href: "/rc-dc", labelKey: "navRcDcTab" },
  { href: "/ac", labelKey: "navRlcTab" },
  { href: "/kirchhoff-ac", labelKey: "navKirchhoffACTab" },
  { href: "/three-phase", labelKey: "navThreePhaseTab" },
  { href: "/magnetic", labelKey: "navMagneticTab" },
] as const;

export function SimulatorNav() {
  const {
    state: { lang },
  } = useUI();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const activeSimulator =
    SIMULATORS.find((s) => s.href === pathname) ?? SIMULATORS[0];

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Mobile: dropdown — visible only under sm */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t(lang, activeSimulator.labelKey)}
          <span
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute top-full right-0 z-50 mt-1 min-w-[10rem] rounded-lg border border-zinc-200 bg-white py-0.5 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          >
            {SIMULATORS.map(({ href, labelKey }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={
                    active
                      ? "pointer-events-none mx-0.5 flex w-full items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "mx-0.5 flex w-full items-center rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }
                >
                  {t(lang, labelKey)}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: pills — hidden under lg */}
      <nav
        aria-label="Simulators"
        className="hidden items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 lg:flex dark:border-zinc-700 dark:bg-zinc-800/60"
      >
        {SIMULATORS.map(({ href, labelKey }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "pointer-events-none inline-flex items-center rounded-md bg-white px-3 py-1 text-xs font-semibold text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }
            >
              {t(lang, labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
