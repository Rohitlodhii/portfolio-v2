import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blogs";
import {
  DEFAULT_IMAGE_BACKGROUND,
  DEFAULT_IMAGE_TEXT_COLOR,
  formatBlogDateLong,
} from "@/lib/blog-utils";

const size = { width: 1200, height: 630 };

/** Public: redirects to the supplied cover image, or renders one on demand. */
export async function GET(_request: Request, ctx: RouteContext<"/api/blogs/[slug]/image">) {
  const { slug } = await ctx.params;

  let post;
  try {
    post = await getBlogPostBySlug(slug);
  } catch {
    return new Response("Failed to load blog post", { status: 500 });
  }

  if (!post) return new Response("Blog post not found", { status: 404 });
  // Set via Location rather than Response.redirect, which throws on a non-absolute URL.
  if (post.imageUrl?.trim()) {
    return new Response(null, { status: 307, headers: { Location: post.imageUrl.trim() } });
  }

  const background = post.imageBackground ?? DEFAULT_IMAGE_BACKGROUND;
  const color = post.imageTextColor ?? DEFAULT_IMAGE_TEXT_COLOR;
  const heading = post.imageTitle ?? post.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background,
          color,
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.65 }}>
          {formatBlogDateLong(post.date)}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: heading.length > 70 ? 64 : 80,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, opacity: 0.65 }}>
          <div style={{ display: "flex" }}>{post.readTimeMinutes} min read</div>
          <div style={{ display: "flex" }}>{post.tags.slice(0, 3).join(" · ")}</div>
        </div>
      </div>
    ),
    size,
  );
}
