import type { ReactNode } from "react";

export function FeatureGrid({ children }: { children: ReactNode }) {
  return <div className="my-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
