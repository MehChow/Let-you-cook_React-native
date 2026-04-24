export function parseServingRange(
  serving: string
): { min: number; max: number } | null {
  const s = serving.trim();
  const m = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const min = Number(m[1]);
    const max = Number(m[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return { min: n, max: n };
}

