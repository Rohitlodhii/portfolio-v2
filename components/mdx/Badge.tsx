import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full  text-xs font-medium px-2.5 py-1 text-[11px] text-muted-foreground bg-secondary bg-linear-to-b from-white/30 dark:from-white/12 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">{children}</span>;
}
