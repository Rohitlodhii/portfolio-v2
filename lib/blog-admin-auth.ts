import "server-only";

import { timingSafeEqual } from "node:crypto";

const errorResponse = (error: string, status: number) => Response.json({ error }, { status });

function readSecret() {
  const secret = process.env.BLOG_ADMIN_API_KEY?.trim() || process.env.API_KEY?.trim();
  return secret || undefined;
}

function readPresentedKey(request: Request) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];

  return (
    request.headers.get("x-api-key")?.trim() ||
    request.headers.get("x-blog-api-key")?.trim() ||
    bearer?.trim() ||
    undefined
  );
}

function matches(presented: string, secret: string) {
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Returns `null` when the request is authorized, otherwise the response to send.
 * Fails closed: with no key configured every request is rejected.
 */
export function requireBlogAdmin(request: Request): Response | null {
  const secret = readSecret();
  if (!secret) return errorResponse("Blog admin API key is not configured", 500);

  const presented = readPresentedKey(request);
  if (!presented || !matches(presented, secret)) return errorResponse("Unauthorized", 401);

  return null;
}
