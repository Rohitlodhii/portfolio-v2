"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useWebHaptics } from "web-haptics/react";
import type { HapticInput, TriggerOptions } from "web-haptics";

const STORAGE_KEY = "haptics-enabled";

/**
 * Whether haptics are on, kept outside React.
 *
 * The switch lives in the dock but `trigger` is called from anywhere, so the
 * value has to be shared. A module store keeps `useHaptics()` a drop-in hook —
 * no provider to thread through `app/layout.tsx` — and every mounted consumer
 * re-renders through `useSyncExternalStore` when the switch flips.
 */
let enabled = true;
let hydrated = false;
const listeners = new Set<() => void>();

/** localStorage throws in private mode / when storage is blocked, so guard it. */
function readStored(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function subscribe(listener: () => void) {
  // First subscriber pulls the persisted value in. Doing it here rather than at
  // module scope keeps the snapshot stable through hydration: the server render
  // uses `getServerSnapshot`, and React re-renders if the client value differs.
  if (!hydrated) {
    hydrated = true;
    enabled = readStored();
  }

  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return enabled;
}

/** Default to on so the switch doesn't render mid-flip before hydration. */
function getServerSnapshot() {
  return true;
}

function setHapticsEnabled(next: boolean) {
  if (next === enabled) return;

  enabled = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Not persisting is fine — the toggle still works for this session.
  }

  listeners.forEach((listener) => listener());
}

export const useHaptics = () => {
  const { trigger, cancel, isSupported } = useWebHaptics({ debug: true });
  const isEnabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const triggerWithShake = useCallback(
    (input?: HapticInput, options?: TriggerOptions) => {
      // Reads the store rather than the render snapshot, so a caller that enables
      // haptics and immediately fires a confirming buzz isn't blocked by the
      // stale `false` its closure was created with.
      if (!getSnapshot()) return undefined;
      return trigger(input, options);
    },
    [trigger],
  );

  const setEnabled = useCallback(
    (next: boolean) => {
      // Stop anything mid-pattern, otherwise turning it off still buzzes out.
      if (!next) cancel();
      setHapticsEnabled(next);
    },
    [cancel],
  );

  const toggle = useCallback(() => setEnabled(!isEnabled), [setEnabled, isEnabled]);

  return {
    trigger: triggerWithShake,
    cancel,
    isSupported,
    isEnabled,
    setEnabled,
    toggle,
  };
};
