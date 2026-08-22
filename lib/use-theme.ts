"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";
/** Tailwind's `dark` variant is `&:is(.dark *)`, so the class goes on `<html>`. */
const DARK_CLASS = "dark";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Whether night mode is on, kept outside React — same shape as `use-haptics.ts`.
 *
 * The switch lives in the dock but the theme is a document-level concern, so a
 * module store keeps `useTheme()` a drop-in hook with no provider to thread
 * through `app/layout.tsx`, and every mounted consumer re-renders through
 * `useSyncExternalStore` when the switch flips.
 */
let isDark = false;
let hydrated = false;
const listeners = new Set<() => void>();

/** Only "dark"/"light" count as a choice — anything else means "follow the OS". */
function readStoredChoice(): "dark" | "light" | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    // localStorage throws in private mode / when storage is blocked.
    return null;
  }
}

/**
 * The same resolution the boot script in `app/layout.tsx` runs. Both have to
 * agree or the switch renders mid-flip against an already-themed page.
 */
function resolveTheme(): boolean {
  const choice = readStoredChoice();
  if (choice) return choice === "dark";
  return window.matchMedia(DARK_QUERY).matches;
}

function applyClass(dark: boolean) {
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Track the OS only until the visitor picks a side — `setDark` writes the key. */
function handleSystemChange(event: MediaQueryListEvent) {
  if (readStoredChoice()) return;
  if (event.matches === isDark) return;

  isDark = event.matches;
  applyClass(isDark);
  emit();
}

function ensureHydrated() {
  // Doing this here rather than at module scope keeps the snapshot stable
  // through hydration: the server render uses `getServerSnapshot`, and React
  // re-renders if the client value differs.
  if (hydrated) return;

  hydrated = true;
  isDark = resolveTheme();
  window.matchMedia(DARK_QUERY).addEventListener("change", handleSystemChange);
}

function subscribe(listener: () => void) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isDark;
}

/** The server can't know the preference; the boot script corrects the DOM before paint. */
function getServerSnapshot() {
  return false;
}

function setThemeDark(next: boolean) {
  try {
    // Written first: persisting the choice is also what stops `handleSystemChange`
    // from overriding it later, and that has to hold even on a no-op toggle.
    window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    // Not persisting is fine — the toggle still works for this session.
  }

  if (next === isDark) return;

  isDark = next;
  applyClass(next);
  emit();
}

export const useTheme = () => {
  const isDarkValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    // React's dev-only Strict Mode remount resets `<html>` to the attributes it
    // owns from JSX, dropping the class the boot script added. `ensureHydrated`
    // first, because on the very first pass the snapshot is still the server's
    // `false` and re-applying that would strip a legitimately dark document.
    ensureHydrated();
    applyClass(getSnapshot());
  }, [isDarkValue]);

  const setDark = useCallback((next: boolean) => setThemeDark(next), []);
  const toggle = useCallback(() => setThemeDark(!getSnapshot()), []);

  return {
    isDark: isDarkValue,
    setDark,
    toggle,
  };
};
