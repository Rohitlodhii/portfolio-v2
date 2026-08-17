import z from "zod";

const optionalText = z.string().trim().min(1).optional();

export const blogSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by single hyphens");

/**
 * Only title and content are required — everything else is derived server side
 * by `deriveBlogRecord` when omitted.
 */
export const blogInputSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  slug: blogSlugSchema.optional(),
  date: optionalText,
  summary: optionalText,
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  readTimeMinutes: z.coerce.number().int().positive().max(600).optional(),
  prompt: optionalText,
  introductionText: optionalText,
  imageUrl: z.string().trim().url().optional(),
  imageTitle: optionalText,
  imageBackground: optionalText,
  imageTextColor: optionalText,
});

export type BlogInput = z.infer<typeof blogInputSchema>;
