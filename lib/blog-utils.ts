import { slugifyHeading } from "@/lib/mdx-headings";
import type { BlogInput } from "@/lib/blog-schemas";

const WORDS_PER_MINUTE = 200;
const SUMMARY_MAX_LENGTH = 200;

/** Posts without a date sort last rather than being rejected. */
export const FALLBACK_DATE = new Date("1970-01-01T00:00:00.000Z");

export const DEFAULT_IMAGE_BACKGROUND = "#0a0a0a";
export const DEFAULT_IMAGE_TEXT_COLOR = "#fafafa";

export function slugify(value: string) {
  return slugifyHeading(value).replace(/^-|-$/g, "");
}

/** Strips markdown down to prose so summaries and read times ignore syntax. */
function toPlainText(content: string) {
  return content
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/^\s{0,3}([-*_]\s*){3,}$/gm, " ")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSummary(content: string, maxLength = SUMMARY_MAX_LENGTH) {
  const text = toPlainText(content);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > maxLength / 2 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

export function estimateReadTime(content: string) {
  const words = toPlainText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Accepts frontmatter arrays as well as comma-separated strings. */
export function normalizeTags(tags: unknown): string[] {
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];

  return [...new Set(list.map((tag) => String(tag).trim()).filter(Boolean))];
}

export function parseBlogDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== "string" || !value.trim()) return undefined;

  const trimmed = value.trim();
  // Treat bare YYYY-MM-DD as UTC midnight so the rendered day never shifts.
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00.000Z` : trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatBlogDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatBlogDateLong(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Every field the DB needs, with nothing left undefined. */
export type BlogRecord = {
  slug: string;
  title: string;
  date: Date;
  summary: string;
  content: string;
  tags: string[];
  readTimeMinutes: number;
  prompt: string | null;
  introductionText: string | null;
  imageUrl: string | null;
  imageTitle: string | null;
  imageBackground: string | null;
  imageTextColor: string | null;
};

/** Fills in everything the caller left out. */
export function deriveBlogRecord(input: BlogInput): BlogRecord {
  const content = input.content.trim();

  return {
    slug: input.slug ?? slugify(input.title),
    title: input.title,
    date: parseBlogDate(input.date) ?? FALLBACK_DATE,
    summary: input.summary ?? buildSummary(content),
    content,
    tags: normalizeTags(input.tags),
    readTimeMinutes: input.readTimeMinutes ?? estimateReadTime(content),
    prompt: input.prompt ?? null,
    introductionText: input.introductionText ?? null,
    imageUrl: input.imageUrl ?? null,
    imageTitle: input.imageTitle ?? null,
    imageBackground: input.imageBackground ?? null,
    imageTextColor: input.imageTextColor ?? null,
  };
}

/**
 * Maps markdown frontmatter onto `blogInputSchema` keys, tolerating the aliases
 * used in `config/data/blogs` (`coverImage`, `readtime`). Empty values are
 * dropped so the server derives them instead of failing validation.
 */
export function frontmatterToBlogInput(
  data: Record<string, unknown>,
  content: string,
  fallbackSlug?: string,
) {
  const text = (value: unknown) => {
    if (value instanceof Date) return formatBlogDate(value);
    if (typeof value === "number") return String(value);
    if (typeof value !== "string") return undefined;
    return value.trim() || undefined;
  };

  const candidate: Record<string, unknown> = {
    title: text(data.title),
    content,
    slug: text(data.slug) ?? fallbackSlug,
    date: text(data.date),
    summary: text(data.summary),
    tags: data.tags,
    readTimeMinutes: data.readTimeMinutes ?? data.readtime ?? data.readTime,
    prompt: text(data.prompt),
    introductionText: text(data.introductionText) ?? text(data.introduction),
    imageUrl: text(data.imageUrl) ?? text(data.coverImage),
    imageTitle: text(data.imageTitle),
    imageBackground: text(data.imageBackground),
    imageTextColor: text(data.imageTextColor),
  };

  return Object.fromEntries(
    Object.entries(candidate).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

type CoverImageSource = { slug: string; imageUrl?: string | null };

/** Remote cover when one was supplied, otherwise the on-demand generator. */
export function resolveBlogCoverImage(post: CoverImageSource) {
  return post.imageUrl?.trim() ? post.imageUrl : `/api/blogs/${post.slug}/image`;
}

type BlogPostLike = BlogRecord & { id: string; createdAt: Date; updatedAt: Date };

/** API shape: dates as `YYYY-MM-DD`, plus the resolved cover image. */
export function toBlogResponse(post: BlogPostLike) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: formatBlogDate(post.date),
    summary: post.summary,
    content: post.content,
    tags: post.tags,
    readTimeMinutes: post.readTimeMinutes,
    prompt: post.prompt,
    introductionText: post.introductionText,
    imageUrl: post.imageUrl,
    imageTitle: post.imageTitle,
    imageBackground: post.imageBackground,
    imageTextColor: post.imageTextColor,
    coverImage: resolveBlogCoverImage(post),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
