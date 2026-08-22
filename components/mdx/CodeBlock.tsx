"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

export function CodeBlock({ children }: { children?: ReactNode }) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const className =
    typeof children === "object" && children !== null && "props" in children
      ? (children as { props?: { className?: string } }).props?.className
      : undefined;
  const language = className?.match(/language-([\w-]+)/)?.[1];

  async function copy() {
    const text = codeRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl bg-secondary">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="lowercase">{language || "code"}</span>

        <motion.button
          type="button"
          onClick={copy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className={`select-none rounded-md px-2 py-1 normal-case tracking-normal transition-colors cursor-pointer ${
            copied
              ? "bg-emerald-500/15 text-emerald-500 font-medium"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </motion.button>
      </div>
      <pre ref={codeRef} className="overflow-x-auto p-4 text-[12px] leading-6 text-foreground/80">
        {children}
      </pre>
    </div>
  );
}