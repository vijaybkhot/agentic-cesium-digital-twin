const acronymLabels: Record<string, string> = {
  ai: "AI",
  mep: "MEP",
  qc: "QC",
};

export function formatModularSlug(value: string): string {
  return value
    .split("-")
    .map(
      (part) =>
        acronymLabels[part] ?? part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}
