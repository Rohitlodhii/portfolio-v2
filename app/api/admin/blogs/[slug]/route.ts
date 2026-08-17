import z from "zod";
import { requireBlogAdmin } from "@/lib/blog-admin-auth";
import { errorResponse, invalidBlogResponse, readBlogInput } from "@/lib/blog-request";
import { toBlogResponse } from "@/lib/blog-utils";
import {
  deleteBlogPost,
  DuplicateBlogSlugError,
  getBlogPostBySlug,
  replaceBlogPost,
} from "@/lib/blogs";

const notFound = () => errorResponse("Blog post not found", 404);

export async function GET(request: Request, ctx: RouteContext<"/api/admin/blogs/[slug]">) {
  const unauthorized = requireBlogAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { slug } = await ctx.params;
    const post = await getBlogPostBySlug(slug);
    return post ? Response.json(toBlogResponse(post)) : notFound();
  } catch {
    return errorResponse("Failed to load blog post", 500);
  }
}

/** Full replace: fields left out are re-derived from the content, not preserved. */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/blogs/[slug]">) {
  const unauthorized = requireBlogAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await ctx.params;

  try {
    if (!(await getBlogPostBySlug(slug))) return notFound();

    const post = await replaceBlogPost(slug, await readBlogInput(request, slug));
    return Response.json(toBlogResponse(post));
  } catch (error) {
    if (error instanceof z.ZodError) return invalidBlogResponse(error);
    if (error instanceof SyntaxError) return errorResponse("Invalid request body", 400);
    if (error instanceof DuplicateBlogSlugError) return errorResponse(error.message, 409);
    return errorResponse("Failed to update blog post", 500);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/blogs/[slug]">) {
  const unauthorized = requireBlogAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await ctx.params;

  try {
    if (!(await getBlogPostBySlug(slug))) return notFound();

    await deleteBlogPost(slug);
    return Response.json({ deleted: slug });
  } catch {
    return errorResponse("Failed to delete blog post", 500);
  }
}
