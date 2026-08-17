import React from "react";

interface OptionItem {
  name: string;
  type: string;
  defaultVal: string;
  description: string;
}

const defaultOptions: OptionItem[] = [
  {
    name: "attributeName",
    type: "string",
    defaultVal: "'data-morrit'",
    description: "HTML attribute name for source metadata injected into JSX elements."
  },
  {
    name: "rootDir",
    type: "string",
    defaultVal: "process.cwd()",
    description: "Project root directory used to compute relative paths for source files."
  },
  {
    name: "exclude",
    type: "string[]",
    defaultVal: "['Fragment', 'React.Fragment']",
    description: "React component or HTML tag names to skip during metadata injection."
  }
];

export function OptionsTable({ options = defaultOptions }: { options?: OptionItem[] }) {
  return (
    <div className="my-6 flex flex-col gap-6 w-full">
      {options.map((opt) => (
        <div key={opt.name} className="flex flex-col gap-1 py-1 rounded-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">
              {opt.name}
            </span>
            <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {opt.type}
            </span>
            <span className="text-[10px] text-muted-foreground sm:ml-auto font-mono">
              default: <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">{opt.defaultVal}</code>
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            {opt.description}
          </p>
        </div>
      ))}
    </div>
  );
}
