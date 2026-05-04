const CONDITIONS = new Set(["excellent", "good", "fair", "poor"]);
const FUELS = new Set(["gasoline", "diesel", "hybrid", "electric"]);
const TRANS = new Set(["manual", "automatic", "cvt"]);

export function mapVehicleCondition(raw: unknown) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).toLowerCase().trim().replace(/\s+/g, "_");
  return CONDITIONS.has(s) ? s : undefined;
}

export function mapFuelType(raw: unknown) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).toLowerCase().trim();
  if (s === "petrol") return "gasoline";
  return FUELS.has(s) ? s : undefined;
}

export function mapTransmission(raw: unknown) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).toLowerCase().trim();
  return TRANS.has(s) ? s : undefined;
}
