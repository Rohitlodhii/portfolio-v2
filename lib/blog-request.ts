import "server-only";

import matter from "gray-matter";
import z from "zod";
import { blogInputSchema } from "@/lib/blog-schemas";
import { frontmatterToBlogInput } from "@/lib/blog-utils";

export const errorResponse = (error: string, status: number, details?: unknown) =>
  Response.json(details === undefined ? { error } : { error, details }, { status });

export const invalidBlogResponse = (error: z.ZodError) =>
  errorResponse("Invalid blog data", 400, z.flattenError(error).fieldErrors);

function isMarkdownRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  return /text\/(markdown|x-markdown|plain)/.test(contentType);
}

/**
 * Accepts a JSON body or a raw markdown document with frontmatter, so a `.md`
 * file can be uploaded as-is. Throws `ZodError` / `SyntaxError` for the caller
 * to translate into a 400.
 */
export async function readBlogInput(request: Request, fallbackSlug?: string) {
  if (!isMarkdownRequest(request)) {
    return blogInputSchema.parse(await request.json());
  }

  const source = await request.text();
  if (!source.trim()) throw new SyntaxError("Empty markdown body");

  const { data, content } = matter(source);
  return blogInputSchema.parse(frontmatterToBlogInput(data as Record<string, unknown>, content, fallbackSlug));
}
