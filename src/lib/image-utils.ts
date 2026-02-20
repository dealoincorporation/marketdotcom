export function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  let s = value.trim()
  if (!s) return null

  // If it's a JSON-encoded array (e.g. '["https://..."]'), parse and take first.
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) {
        const first = parsed.find((v) => typeof v === "string" && v.trim())
        if (typeof first === "string") s = first.trim()
      }
    } catch {
      // ignore JSON parse errors; continue with raw string
    }
  }

  // Strip wrapping quotes if present.
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }

  // Repair malformed scheme like "https:/foo" -> "https://foo".
  s = s.replace(/^(https?):\/(?!\/)/i, "$1://")

  // Reject obvious JSON-y leftovers.
  if (s.includes('["') || s.includes('"]') || s.includes("[" ) || s.includes("]")) return null

  // Allow absolute URLs and same-origin public paths.
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s

  return null
}

export function normalizeImageUrls(...values: unknown[]): string[] {
  const out: string[] = []

  const push = (v: unknown) => {
    const u = normalizeImageUrl(v)
    if (u) out.push(u)
  }

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const v of value) push(v)
    } else {
      push(value)
    }
  }

  // De-dupe, cap to 10
  return Array.from(new Set(out)).slice(0, 10)
}

