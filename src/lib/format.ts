function part(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === "—") return "";
  return trimmed;
}

export function formatPlace(
  location?: string | null,
  country?: string | null,
) {
  return [part(location), part(country)].filter(Boolean).join(", ");
}
