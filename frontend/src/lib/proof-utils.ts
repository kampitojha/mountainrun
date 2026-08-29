/**
 * Utility to parse single or multiple proof image URLs from ProofUpload.activityImageUrl.
 * Supports legacy single URL string, comma-separated strings, and JSON stringified string arrays.
 */
export function parseProofImages(activityImageUrl?: string | null): string[] {
  if (!activityImageUrl || typeof activityImageUrl !== "string") {
    return [];
  }

  const trimmed = activityImageUrl.trim();
  if (!trimmed) {
    return [];
  }

  // 1. Try parsing JSON array format (e.g. '["https://...", "https://..."]')
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
          .map((item) => item.trim());
      }
    } catch {
      // Fall through to other checks
    }
  }

  // 2. Custom delimiter |||
  if (trimmed.includes("|||")) {
    return trimmed.split("|||").map((s) => s.trim()).filter(Boolean);
  }

  // 3. Comma-separated (ignoring commas inside data: URLs if any)
  if (trimmed.includes(",") && !trimmed.startsWith("data:")) {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return [trimmed];
}
