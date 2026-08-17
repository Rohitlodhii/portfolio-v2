import z from "zod";
import { requireBlogAdmin } from "@/lib/blog-admin-auth";
import { errorResponse, invalidBlogResponse, readBlogInput } from "@/lib/blog-request";
import { toBlogResponse } from "@/lib/blog-utils";
import { createBlogPost, DuplicateBlogSlugError, listBlogPosts } from "@/lib/blogs";

export async function GET(request: Request) {
  const unauthorized = requireBlogAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const posts = await listBlogPosts();
    return Response.json(posts.map(toBlogResponse));
  } catch {
    return errorResponse("Failed to load blog posts", 500);
  }
}

/** Accepts a JSON body or a raw markdown document (`Content-Type: text/markdown`). */
export async function POST(request: Request) {
  const unauthorized = requireBlogAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const post = await createBlogPost(await readBlogInput(request));
    return Response.json(toBlogResponse(post), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return invalidBlogResponse(error);
    if (error instanceof SyntaxError) return errorResponse("Invalid request body", 400);
    if (error instanceof DuplicateBlogSlugError) return errorResponse(error.message, 409);
    return errorResponse("Failed to create blog post", 500);
  }
}
