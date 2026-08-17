"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STEPS = ["idle", "hover", "select", "type", "add", "copy", "apply"] as const;
type Step = (typeof STEPS)[number];

const HOLD: Record<Step, number> = {
  idle: 800,
  hover: 1100,
  select: 850,
  type: 1900,
  add: 1000,
  copy: 1300,
  apply: 2700,
};

const INSTRUCTION = "make this button rounded and warm orange";

// Morrit overlay tokens, mirrored so the illustration matches the real tool.
const INK = "#0E0E11";
const INK_RAISED = "#16161A";
const LINE = "rgba(255,255,255,0.10)";
const FG = "#EDEDF0";
const MUTED = "#8B8B96";
const ACCENT = "#c58c38";

const CTA = { left: "8%", top: "57%", width: "36%", height: "14%" };

const CURSOR: Record<Step, { left: string; top: string }> = {
  idle: { left: "80%", top: "18%" },
  hover: { left: "27%", top: "65%" },
  select: { left: "27%", top: "65%" },
  type: { left: "62%", top: "42%" },
  add: { left: "86%", top: "49%" },
  copy: { left: "79%", top: "89%" },
  apply: { left: "93%", top: "22%" },
};

const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.7 } as const;

export default function PromptFlow() {
  const reduced = useReducedMotion();
  const [raw, setRaw] = useState<Step>("idle");
  const [typedRaw, setTypedRaw] = useState("");

  // Reduced motion gets the settled end state instead of a running loop.
  const step: Step = reduced ? "apply" : raw;
  const typed = reduced ? INSTRUCTION : typedRaw;

  const index = STEPS.indexOf(step);
  const reached = (s: Step) => index >= STEPS.indexOf(s);

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(
      () => setRaw(STEPS[(STEPS.indexOf(raw) + 1) % STEPS.length]),
      HOLD[raw]
    );
    return () => clearTimeout(id);
  }, [raw, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (raw !== "type") {
      if (raw === "idle") setTypedRaw("");
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedRaw(INSTRUCTION.slice(0, i));
      if (i >= INSTRUCTION.length) clearInterval(id);
    }, HOLD.type / (INSTRUCTION.length + 8));
    return () => clearInterval(id);
  }, [raw, reduced]);

  const popupOpen = step === "select" || step === "type";
  const applied = step === "apply";

  return (
    <section className="pointer-events-auto w-full max-w-4xl mx-auto mt-20 sm:mt-28 mb-28 sm:mb-40 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-2 sm:mb-3">
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-orange-950 tracking-tight"
          style={{ fontFamily: "var(--font-nunito), sans-serif" }}
        >
          Introducing morrit Prompts
        </h2>
      </div>

      <p
        className="text-[11px] sm:text-sm md:text-[15px] text-[#475569] max-w-2xl text-center leading-snug mb-6 sm:mb-10 font-medium"
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        Stop describing which button you meant. Pick the element on screen, write
        the change, and Morrit hands your agent an exact prompt with the file and
        line already in it.
      </p>

      {/* Main Container - Left Illustration Only */}
      <div className="w-full rounded-2xl sm:rounded-[20px] border border-stone-300/60 bg-[#faf8f3] p-3 sm:p-5 overflow-hidden shadow-[0_14px_40px_rgba(120,100,70,0.07)]">
        <MockApp
          step={step}
          typed={typed}
          popupOpen={popupOpen}
          applied={applied}
          reached={reached}
          reduced={!!reduced}
        />
      </div>
    </section>
  );
}

interface StageProps {
  step: Step;
  typed: string;
  popupOpen: boolean;
  applied: boolean;
  reached: (s: Step) => boolean;
  reduced: boolean;
}

/** The user's app, with the Morrit overlay running on top of it. */
function MockApp({ step, typed, popupOpen, applied, reached, reduced }: StageProps) {
  const inspecting = step !== "idle";

  return (
    <div className="relative rounded-xl sm:rounded-2xl border border-stone-300/50 bg-[#f1ede3] p-1.5 sm:p-2.5 shadow-[0_6px_18px_rgba(120,100,70,0.06)] overflow-hidden">
      <BrowserChrome label="localhost:3000" />

      <div className="relative mt-1.5 sm:mt-2 aspect-[16/10] rounded-lg sm:rounded-xl bg-white border border-stone-200/70 overflow-hidden">
        {/* Skeleton of the page being edited */}
        <div className="absolute inset-0 p-[5%] flex flex-col">
          <div className="flex items-center gap-2 mb-[6%]">
            <div className="h-2.5 w-2.5 rounded-[3px] bg-orange-950/70" />
            <div className="h-1.5 w-10 rounded-full bg-stone-300" />
            <div className="ml-auto flex gap-1.5">
              <div className="h-1.5 w-6 rounded-full bg-stone-200" />
              <div className="h-1.5 w-6 rounded-full bg-stone-200" />
            </div>
          </div>
          <div className="h-3 w-[62%] rounded-full bg-stone-300/90 mb-2" />
          <div className="h-2 w-[45%] rounded-full bg-stone-200 mb-1.5" />
          <div className="h-2 w-[38%] rounded-full bg-stone-200" />
        </div>

        {/* The element under edit. */}
        <motion.div
          className="absolute"
          style={CTA}
          animate={{
            borderRadius: applied ? 999 : 6,
            backgroundColor: applied ? "rgba(197,140,56,0.55)" : "#e7e5e4",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        />

        {/* Hover / selection ring */}
        <AnimatePresence>
          {inspecting && !applied && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: `calc(${CTA.left} - 4px)`,
                top: `calc(${CTA.top} - 4px)`,
                width: `calc(${CTA.width} + 8px)`,
                height: `calc(${CTA.height} + 8px)`,
                borderRadius: 9,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                boxShadow: reached("select")
                  ? `0 0 0 1.5px ${ACCENT}, 0 0 0 5px rgba(197,140,56,0.16)`
                  : `0 0 0 1.5px rgba(197,140,56,0.65)`,
                backgroundColor: reached("select")
                  ? "rgba(197,140,56,0.10)"
                  : "rgba(197,140,56,0.05)",
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span
                className="absolute -top-[18px] left-0 px-1 rounded-[3px] font-mono whitespace-nowrap"
                style={{
                  fontSize: 11,
                  lineHeight: "16px",
                  background: INK,
                  color: FG,
                }}
              >
                Hero.tsx:<span style={{ color: ACCENT }}>42</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt popup */}
        <AnimatePresence>
          {popupOpen && (
            <motion.div
              className="absolute rounded-lg overflow-hidden"
              style={{
                left: "46%",
                top: "30%",
                width: "48%",
                background: INK,
                border: `1px solid ${LINE}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.34)",
                padding: 7,
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.16 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono" style={{ fontSize: 11, color: FG }}>
                  Hero.tsx <span style={{ color: MUTED }}>·</span>{" "}
                  <span style={{ color: ACCENT }}>button</span>
                </span>
                <span style={{ fontSize: 10, color: MUTED }}>✕</span>
              </div>
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 3 }}>
                What would you like to change?
              </div>
              <div
                className="rounded"
                style={{
                  minHeight: 34,
                  padding: "4px 5px",
                  background: INK_RAISED,
                  border: `1px solid ${step === "type" ? ACCENT : LINE}`,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: typed ? FG : MUTED,
                }}
              >
                {typed || "Make this button red…"}
                {step === "type" && !reduced && (
                  <motion.span
                    className="inline-block align-middle"
                    style={{ width: 1, height: 7, background: ACCENT, marginLeft: 1 }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
                  />
                )}
              </div>
              <div className="flex justify-end gap-1 mt-1.5">
                <span
                  className="rounded"
                  style={{
                    fontSize: 10,
                    padding: "2px 5px",
                    color: FG,
                    border: `1px solid ${LINE}`,
                  }}
                >
                  Cancel
                </span>
                <motion.span
                  className="rounded"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    background: ACCENT,
                    color: "#1A1206",
                  }}
                  animate={{ opacity: typed ? 1 : 0.45 }}
                >
                  Add
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PromptDock step={step} reached={reached} />

        {/* Pointer */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          animate={{ ...CURSOR[step], scale: step === "select" || step === "copy" ? 0.82 : 1 }}
          transition={SPRING}
          style={{ width: 13, height: 13 }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path
              d="M5 2l14 9-6.5 1.2L15 20l-3 1-3-8.2L5 15z"
              fill="#0f172a"
              stroke="#fff"
              strokeWidth="1.6"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

/** Morrit's floating dock, counting captured changes. */
function PromptDock({
  step,
  reached,
}: {
  step: Step;
  reached: (s: Step) => boolean;
}) {
  const count = reached("add") ? 1 : 0;
  const copying = step === "copy" || step === "apply";

  return (
    <div className="absolute right-[3%] bottom-[5%] z-10 flex items-end gap-1.5">
      <AnimatePresence>
        {step !== "idle" && (
          <motion.div
            className="rounded-lg overflow-hidden"
            style={{
              width: 200,
              background: INK,
              border: `1px solid ${LINE}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.34)",
            }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="flex items-center gap-1.5 px-1.5 py-1"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <span
                aria-hidden="true"
                className="rounded-full"
                style={{ width: 3, height: 3, background: ACCENT }}
              />
              <span
                className="uppercase flex-1"
                style={{ fontSize: 10, letterSpacing: "0.06em", color: MUTED }}
              >
                Create Prompt
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 10, color: count ? ACCENT : MUTED }}
              >
                {count} {count === 1 ? "change" : "changes"}
              </span>
            </div>

            <div style={{ padding: 3, minHeight: 34 }}>
              <AnimatePresence mode="wait">
                {count === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ fontSize: 10, lineHeight: 1.6, color: MUTED, padding: "3px 4px" }}
                  >
                    Click an element, then describe the change.
                  </motion.div>
                ) : (
                  <motion.div
                    key="target"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: "2px 4px" }}
                  >
                    <div className="font-mono truncate" style={{ fontSize: 10, color: FG }}>
                      Hero.tsx<span style={{ color: ACCENT }}>:42</span>
                      <span style={{ color: MUTED }}> · button</span>
                    </div>
                    <div
                      className="truncate"
                      style={{ fontSize: 10, lineHeight: 1.5, color: MUTED }}
                    >
                      {INSTRUCTION}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="flex gap-1 p-1"
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <span
                className="rounded"
                style={{
                  fontSize: 10,
                  padding: "2px 4px",
                  color: FG,
                  border: `1px solid ${LINE}`,
                  opacity: count ? 1 : 0.4,
                }}
              >
                Clear
              </span>
              <motion.span
                className="rounded flex-1 text-center"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 4px",
                  background: ACCENT,
                  color: "#1A1206",
                }}
                animate={{ opacity: count ? 1 : 0.4, scale: step === "copy" ? 0.95 : 1 }}
                transition={{ duration: 0.15 }}
              >
                {copying ? "Copied" : "Copy Prompt"}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          width: 24,
          height: 24,
          background: step === "idle" ? INK : ACCENT,
          border: `1px solid ${step === "idle" ? LINE : ACCENT}`,
        }}
      >
        <img src="/logo.png" alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
      </div>
    </div>
  );
}

function BrowserChrome({ label, mono = false }: { label: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
      </div>
      <div className="flex-1 h-4 sm:h-5 rounded-full bg-stone-200/70 flex items-center px-2">
        <span
          className={`text-[8px] sm:text-[9px] text-stone-500 font-semibold truncate ${mono ? "font-mono" : ""}`}
          style={mono ? undefined : { fontFamily: "var(--font-geist-sans), sans-serif" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}