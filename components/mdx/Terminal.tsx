"use client";

import { useState, useId, type ReactNode } from "react";
import { motion } from "motion/react";

type PackageManager = "npm" | "pnpm" | "bun";
type Mode = "install" | "exec";

interface TerminalProps {
  children?: ReactNode;
  command?: string;
  pkg?: string;
  isDev?: boolean;
}

const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "bun"];

// Prefixes we recognise so they can be stripped and re-applied per manager.
const INSTALL_PREFIX =
  /^(?:npm (?:i|install)|pnpm (?:add|i|install)|bun (?:add|i|install)|yarn add)\s+/;
const EXEC_PREFIX = /^(?:npx|pnpx|pnpm dlx|bunx|bun x|yarn dlx)\s+/;

// Tab label + prefix for each manager, per mode. `npm i` and `npx` are different
// commands, so the switcher has to know which family it is rewriting.
const PREFIXES: Record<Mode, Record<PackageManager, { label: string; prefix: string; devFlag: string }>> = {
  install: {
    npm: { label: "npm", prefix: "npm i", devFlag: "-D" },
    pnpm: { label: "pnpm", prefix: "pnpm add", devFlag: "-D" },
    bun: { label: "bun", prefix: "bun add", devFlag: "-d" },
  },
  exec: {
    npm: { label: "npx", prefix: "npx", devFlag: "" },
    pnpm: { label: "pnpx", prefix: "pnpx", devFlag: "" },
    bun: { label: "bunx", prefix: "bunx", devFlag: "" },
  },
};

export function Terminal({
  children,
  command = "",
  pkg = "",
  isDev = false,
}: TerminalProps) {
  const [selectedPm, setSelectedPm] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState(false);
  const layoutId = useId();

  // Extract raw string from children, command, or pkg prop
  let rawInput = "";
  if (typeof children === "string") {
    rawInput = children;
  } else if (command) {
    rawInput = command;
  } else if (pkg) {
    rawInput = pkg;
  } else if (children) {
    rawInput = String(children);
  }

  rawInput = rawInput.trim();

  // `pkg` / children hold a bare package name, so they always get the install
  // switcher. `command` is inspected: an install or exec line gets rewritten per
  // manager, anything else (adb, git, docker …) runs exactly as written.
  const mode: Mode | null = EXEC_PREFIX.test(rawInput)
    ? "exec"
    : !command || INSTALL_PREFIX.test(rawInput)
      ? "install"
      : null;

  // Everything after the prefix — the package name, or the exec target and its args.
  const args =
    mode === "exec"
      ? rawInput.replace(EXEC_PREFIX, "")
      : rawInput.replace(INSTALL_PREFIX, "");

  const getFormattedCommand = (pm: PackageManager) => {
    if (!mode || !args) return rawInput;
    const { prefix, devFlag } = PREFIXES[mode][pm];

    return [prefix, mode === "install" && isDev ? devFlag : "", args]
      .filter(Boolean)
      .join(" ");
  };

  const currentCommand = mode ? getFormattedCommand(selectedPm) : rawInput;

  async function copy() {
    await navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="my-6 flex flex-col items-start gap-0">
      {/* Top Switcher with unrounded bottom-left border */}
      {mode && (
        <div className="relative z-10 -mb-[1px] flex items-center rounded-t-lg rounded-bl-none   border-b-0 bg-secondary p-1 backdrop-blur-sm">
          {PACKAGE_MANAGERS.map((pm) => (
            <button
              key={pm}
              type="button"
              onClick={() => setSelectedPm(pm)}
              className={`relative rounded-md px-3 py-1 font-mono text-xs lowercase text-muted-foreground transition-colors cursor-pointer hover:text-foreground ${
                selectedPm === pm ? "text-foreground font-medium" : ""
              }`}
            >
              {selectedPm === pm && (
                <motion.div
                  layoutId={`active-pm-tab-${layoutId}`}
                  className="absolute inset-0 rounded-md bg-background  "
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{PREFIXES[mode][pm].label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Command Box — square top-left only when it butts against the switcher */}
      <div
        className={`group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-secondary px-4 py-3 ${
          mode ? "rounded-tl-none" : ""
        }`}
      >
        <pre className="overflow-x-auto font-mono text-[12px] leading-6 text-neutral-800">
          <span>{currentCommand}</span>
        </pre>

        {/* Copy Button */}
        <motion.button
          type="button"
          onClick={copy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className={`shrink-0 select-none rounded-md px-2.5 py-1 text-xs normal-case tracking-normal transition-colors cursor-pointer ${
            copied
              ? "bg-emerald-500/15 text-emerald-500 font-medium"
              : "text-zinc-400 hover:bg-background hover:text-neutral-900"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </motion.button>
      </div>
    </div>
  );
}

export const TerminalCommand = Terminal;
