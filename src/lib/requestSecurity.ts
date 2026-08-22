import "server-only";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_MAX_BODY_BYTES = 32 * 1024;

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export async function readJsonObject(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES
): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestError("요청 내용이 너무 큽니다.", 413);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new RequestError("요청 내용이 너무 큽니다.", 413);
  }

  try {
    const value = JSON.parse(text) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new RequestError("올바른 요청 형식이 아닙니다.");
    }
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("올바른 JSON 요청이 아닙니다.");
  }
}

export function requiredString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number
): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new RequestError("필수 항목을 입력해주세요.");
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new RequestError("입력 내용이 허용 길이를 초과했습니다.");
  }
  return normalized;
}

export function optionalString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number
): string {
  const value = body[key];
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new RequestError("올바른 입력 형식이 아닙니다.");
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new RequestError("입력 내용이 허용 길이를 초과했습니다.");
  }
  return normalized;
}

export function requiredStringArray(
  body: Record<string, unknown>,
  key: string,
  maxItems: number,
  maxItemLength: number
): string[] {
  const value = body[key];
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new RequestError("필수 선택 항목을 확인해주세요.");
  }
  const normalized = value.map((item) => {
    if (typeof item !== "string" || !item.trim() || item.trim().length > maxItemLength) {
      throw new RequestError("올바른 선택 항목이 아닙니다.");
    }
    return item.trim();
  });
  return [...new Set(normalized)];
}

export function optionalStringArray(
  body: Record<string, unknown>,
  key: string,
  maxItems: number,
  maxItemLength: number
): string[] {
  if (body[key] === undefined || body[key] === null) return [];
  if (Array.isArray(body[key]) && body[key].length === 0) return [];
  return requiredStringArray(body, key, maxItems, maxItemLength);
}

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("base64url").slice(0, 32);
}

function requestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  return fingerprint(ip);
}

async function consumeBucket(
  bucketKey: string,
  scope: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("consume_api_rate_limit", {
    p_bucket_key: `${scope}:${bucketKey}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error(`[rate-limit:${scope}] 확인 실패:`, error.message);
    throw new RequestError("요청을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.", 503);
  }
  return data === true;
}

export function consumeRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number
) {
  return consumeBucket(requestFingerprint(request), scope, limit, windowSeconds);
}

export function consumeIdentifierRateLimit(
  identifier: string,
  scope: string,
  limit: number,
  windowSeconds: number
) {
  return consumeBucket(fingerprint(identifier.toLowerCase()), scope, limit, windowSeconds);
}
