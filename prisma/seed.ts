/**
 * Seeds the markdown posts in `config/data/blogs` into the database.
 * Idempotent: keyed on the slug, which is taken from the filename so the URLs
 * inside each post's `prompt` field stay correct.
 *
 * Run with `npm run db:seed` (or `npx prisma db seed`).
 *
 * Builds its own client because `lib/prisma.ts` is marked `server-only`.
 */
import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { blogInputSchema } from "../lib/blog-schemas";
import { deriveBlogRecord, frontmatterToBlogInput } from "../lib/blog-utils";

const blogsDirectory = path.join(process.cwd(), "config", "data", "blogs");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const files = (await fs.readdir(blogsDirectory)).filter((file) => file.endsWith(".md")).sort();

    if (files.length === 0) {
      console.log(`No markdown files found in ${blogsDirectory}`);
      return;
    }

    for (const file of files) {
      const source = await fs.readFile(path.join(blogsDirectory, file), "utf8");
      const { data, content } = matter(source);
      const slug = path.basename(file, ".md");

      const input = blogInputSchema.parse(
        frontmatterToBlogInput(data as Record<string, unknown>, content, slug),
      );
      const record = deriveBlogRecord({ ...input, slug });

      const existed = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
      await prisma.blogPost.upsert({ where: { slug }, create: record, update: record });

      console.log(`${existed ? "updated" : "created"}  ${slug}`);
    }

    console.log(`\nSeeded ${files.length} blog post(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
