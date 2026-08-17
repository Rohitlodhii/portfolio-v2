---
title: "Building This Portfolio With Next.js 15"
date: "2026-02-04"
summary: "How this portfolio was structured with the App Router, markdown blogging, and a practical deployment workflow."
tags: [nextjs, portfolio, markdown]
coverImage : https://i.ibb.co/QvxcDFhc/gradii-1200x630-2-1.png
readtime : 8 
prompt : Read https://rohitlodhi.in/building-this-portfolio-with-nextjs.md , i want to ask question about it
introductionText: "How this portfolio was structured with the App Router, markdown blogging, and a practical deployment workflow. How this portfolio was structured with the App Router, markdown blogging, and a practical deployment workflow."
---

## Why I Built This Portfolio

<p>
I wanted a portfolio that feels fast, simple, and easy to maintain. The goal was to keep the content workflow lightweight so writing new posts does not require a CMS.
</p>

### Stack Decisions

<TechStack>
  <Badge>Next.js 15</Badge>
  <Badge>App Router</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Tailwind CSS</Badge>
  <Badge>Markdown</Badge>
</TechStack>

<List>
    <li><b>Next.js 15</b> with the App Router</li>
    <li><b>TypeScript</b> for predictable refactoring</li>
    <li><b>Tailwind</b> for rapid UI iteration</li>
    <li>File-based Markdown posts in a root <code>blogs/</code> directory</li>
</List>

### Markdown-First Blogging

<p>
Every post is a single <code>.md</code> file. I use frontmatter for post metadata like title, date, and tags. That lets the <code>/blog</code> page list posts automatically while <code>/blog/[blogid]</code> renders the full article.
</p>

```ts
export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    blogid: post.slug,
  }))
}
```

### What I Like About This Approach

<List ordered>
    <li>Version control for content and code in one place.</li>
    <li>No admin dashboard needed.</li>
    <li>Easy to move or back up.</li>
</List>

### Next Improvements

<List>
    <li>Add a search bar for posts.</li>
    <li>Add syntax highlighting for code blocks.</li>
    <li>Add an RSS feed.</li>
</List>

<p>
If you are building your own portfolio, this setup is a strong starting point.
</p>
