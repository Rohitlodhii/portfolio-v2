"use client";

import { useState } from "react";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

/**
 * Copies the post's `prompt` frontmatter — written to be pasted into an AI
 * assistant so it can read and answer questions about the post.
 */
export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={copy}
      aria-label="Copy a prompt for asking an AI about this post"
      className="max-w-fit text-muted-foreground hover:text-foreground"
    >
      {copied ? <IconCheck /> : <IconSparkles />}
      {copied ? "Copied" : "Ask AI about this post"}
    </Button>
  );
}
