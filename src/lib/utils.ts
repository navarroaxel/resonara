export function fmt(n: number, decimals = 2): string {
  return Number.isFinite(n) ? n.toFixed(decimals) : "—";
}

export function fmtWithUnit(
  n: number,
  unit: string,
  notation: "raw" | "si",
  decimals = 2,
): { value: string; unit: string } {
  if (!Number.isFinite(n)) return { value: "—", unit };
  if (notation === "raw") return { value: n.toFixed(decimals), unit };
  const abs = Math.abs(n);
  if (abs >= 1e6)
    return { value: (n / 1e6).toFixed(decimals), unit: `M${unit}` };
  if (abs >= 1e3)
    return { value: (n / 1e3).toFixed(decimals), unit: `k${unit}` };
  if (abs >= 1) return { value: n.toFixed(decimals), unit };
  if (abs >= 1e-3)
    return { value: (n * 1e3).toFixed(decimals), unit: `m${unit}` };
  if (abs >= 1e-6)
    return { value: (n * 1e6).toFixed(decimals), unit: `µ${unit}` };
  return { value: n.toFixed(decimals), unit };
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
