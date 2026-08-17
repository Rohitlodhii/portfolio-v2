import "server-only";

import { prisma } from "@/lib/prisma";
import { deriveBlogRecord } from "@/lib/blog-utils";
import type { BlogInput } from "@/lib/blog-schemas";

export class DuplicateBlogSlugError extends Error {
  constructor(readonly slug: string) {
    super(`A blog post with the slug "${slug}" already exists`);
    this.name = "DuplicateBlogSlugError";
  }
}

/** Prisma's unique-constraint code. */
function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function listBlogPosts() {
  return prisma.blogPost.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
}

export function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function createBlogPost(input: BlogInput) {
  const data = deriveBlogRecord(input);

  try {
    return await prisma.blogPost.create({ data });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateBlogSlugError(data.slug);
    throw error;
  }
}

/** Full replace, per the API contract — omitted fields are re-derived, not kept. */
export async function replaceBlogPost(slug: string, input: BlogInput) {
  const data = deriveBlogRecord({ ...input, slug: input.slug ?? slug });

  try {
    return await prisma.blogPost.update({ where: { slug }, data });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateBlogSlugError(data.slug);
    throw error;
  }
}

export function deleteBlogPost(slug: string) {
  return prisma.blogPost.delete({ where: { slug } });
}
