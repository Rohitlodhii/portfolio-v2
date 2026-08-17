import type { ReactNode } from "react";
import { Badge } from "./Badge";

type TechStackProps = {
  items?: string[];
  children?: ReactNode;
};

export function TechStack({ items, children }: TechStackProps) {
  if (children) {
    return <div className="my-5 flex flex-wrap gap-2">{children}</div>;
  }

  const stackItems = Array.isArray(items) ? items : [];

  return (
    <div className="my-5 flex flex-wrap gap-2">
      {stackItems.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}
