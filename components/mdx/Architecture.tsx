import React from "react";

export interface RoadmapNode {
  title: string;
}

const defaultSteps: RoadmapNode[] = [
  { title: "Electron UI" },
  { title: "Python Backend" },
  { title: "Kokoro TTS" },
  { title: "Generated Audio" }
];

export function Architecture({ items = defaultSteps }: { items?: (string | RoadmapNode)[] }) {
  const normalizedItems: RoadmapNode[] = items.map((item) => {
    if (typeof item === "string") {
      return { title: item };
    }
    return item;
  });

  return (
    <div className="my-8 flex flex-col items-center gap-1 w-full">
      {normalizedItems.map((item, index) => {
        const isLast = index === normalizedItems.length - 1;

        return (
          <React.Fragment key={item.title + index}>
            <div className="rounded-lg bg-secondary px-4 py-2.5 text-xs font-medium text-secondary-foreground border border-border/20 shadow-sm">
              {item.title}
            </div>
            {!isLast && (
              <div className="h-8 w-px border-l-2 border-dashed border-muted-foreground/30 my-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
