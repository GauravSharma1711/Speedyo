import { NextRequest } from "next/server";

export function parseIntParam(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function getPagination(
  req: NextRequest,
  options?: { defaultLimit?: number; maxLimit?: number }
) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseIntParam(searchParams.get("page"), 1));
  const defaultLimit = options?.defaultLimit ?? 50;
  const maxLimit = options?.maxLimit ?? 100;
  const limit = Math.min(maxLimit, Math.max(1, parseIntParam(searchParams.get("limit"), defaultLimit)));
  const skip = (page - 1) * limit;
  return { page, limit, skip, searchParams };
}

