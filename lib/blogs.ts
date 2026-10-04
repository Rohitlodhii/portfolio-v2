import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { prisma } from "@/lib/prisma";
import { deriveBlogRecord, frontmatterToBlogInput, type BlogRecord } from "@/lib/blog-utils";
import { blogInputSchema, type BlogInput } from "@/lib/blog-schemas";

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

const blogsDirectory = path.join(process.cwd(), "config", "data", "blogs");

type FullBlogPost = BlogRecord & { id: string; createdAt: Date; updatedAt: Date };

async function loadFileBlogPosts(): Promise<FullBlogPost[]> {
  try {
    const entries = await fs.readdir(blogsDirectory);
    const files = entries.filter((file) => file.endsWith(".md"));
    const posts: FullBlogPost[] = [];

    for (const file of files) {
      const source = await fs.readFile(path.join(blogsDirectory, file), "utf8");
      const { data, content } = matter(source);
      const slug = path.basename(file, ".md");
      const input = blogInputSchema.parse(
        frontmatterToBlogInput(data as Record<string, unknown>, content, slug),
      );
      const record = deriveBlogRecord({ ...input, slug });
      posts.push({
        ...record,
        id: slug,
        createdAt: record.date,
        updatedAt: record.date,
      });
    }

    return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    console.error("Failed to read local blog files:", err);
    return [];
  }
}

async function loadFileBlogPostBySlug(slug: string): Promise<FullBlogPost | null> {
  try {
    const filePath = path.join(blogsDirectory, `${slug}.md`);
    const source = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(source);
    const input = blogInputSchema.parse(
      frontmatterToBlogInput(data as Record<string, unknown>, content, slug),
    );
    const record = deriveBlogRecord({ ...input, slug });
    return {
      ...record,
      id: slug,
      createdAt: record.date,
      updatedAt: record.date,
    };
  } catch {
    return null;
  }
}

export async function listBlogPosts() {
  if (prisma) {
    try {
      return await prisma.blogPost.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
    } catch (err) {
      console.warn("Prisma query failed, falling back to local files:", err);
    }
  }
  return loadFileBlogPosts();
}

export async function getBlogPostBySlug(slug: string) {
  if (prisma) {
    try {
      const post = await prisma.blogPost.findUnique({ where: { slug } });
      if (post) return post;
    } catch (err) {
      console.warn("Prisma query failed, falling back to local files:", err);
    }
  }
  return loadFileBlogPostBySlug(slug);
}

export async function createBlogPost(input: BlogInput) {
  if (!prisma) {
    throw new Error("Database is not configured for writing blog posts.");
  }
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
  if (!prisma) {
    throw new Error("Database is not configured for writing blog posts.");
  }
  const data = deriveBlogRecord({ ...input, slug: input.slug ?? slug });

  try {
    return await prisma.blogPost.update({ where: { slug }, data });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateBlogSlugError(data.slug);
    throw error;
  }
}

export async function deleteBlogPost(slug: string) {
  if (!prisma) {
    throw new Error("Database is not configured for writing blog posts.");
  }
  return prisma.blogPost.delete({ where: { slug } });
}
