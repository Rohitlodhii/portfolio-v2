import type { ReactNode } from "react";

export function Feature({ children, title }: { children: ReactNode; title: string }) {
  return <div className="rounded-lg border border-border bg-card p-4">
    <h3 className="mb-1.5 text-sm font-semibold tracking-tight">{title}</h3>
    <div className="text-sm leading-6 text-muted-foreground">{children}</div>
  </div>;
}
