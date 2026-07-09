export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function nullableUuid(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  return isValidUuid(value) ? value : null;
}

export function makeUuid() {
  return crypto.randomUUID();
}

export function stableUuid(seed: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  const hex = Array.from({ length: 32 }, (_, index) => {
    hash ^= index + seed.length;
    hash = Math.imul(hash, 0x01000193);
    return ((hash >>> ((index % 4) * 8)) & 0xff).toString(16).padStart(2, "0");
  }).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
