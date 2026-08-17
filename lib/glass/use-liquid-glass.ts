"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Detects whether the browser will actually paint an SVG filter referenced from
 * `backdrop-filter`. There is no feature query for this, hence the UA sniff.
 *
 * Desktop Chromium is the only engine that does. Firefox and Safari parse the
 * `url()` and then discard the whole filter list. Chromium on Android is the
 * nastiest case: it keeps the list but silently skips the `url()`, so the effect
 * degrades to the leftover `blur()` calls — a weak few-pixel blur rather than the
 * deliberate fallback. Better to opt those out and blur on purpose.
 */
function detectSvgFilterSupport() {
  const probe = document.createElement("div");
  probe.style.backdropFilter = "blur(1px)";
  if (!probe.style.backdropFilter) return false;

  const ua = navigator.userAgent.toLowerCase();

  // Chrome, Edge and Firefox on iOS are WebKit wrappers, so they behave as Safari.
  if (/crios|edgios|fxios|iphone|ipad|ipod/.test(ua)) return false;

  if (/android|mobile/.test(ua)) return false;

  return /chrome|chromium|edg/.test(ua) && !/firefox/.test(ua);
}

export interface UseLiquidGlassOptions {
  /** Width of the refracting edge ring, in px. Grows while pressed. */
  depth?: number;
  /** Backdrop blur in px, applied at half strength before the displacement and in full after. */
  blur?: number;
  /** How far the displacement map pushes sampled pixels. */
  strength?: number;
  /** Per-channel offset that produces the prism fringe. 0 disables it. */
  chromaticAberration?: number;
  /** Corner radius fed to the map. Defaults to a pill radius from the measured height. */
  radius?: number;
  brightness?: number;
  saturate?: number;
}

interface Measurement {
  width: number;
  height: number;
  supported: boolean;
}

/**
 * Measures the host element and builds a `backdrop-filter` that matches it.
 *
 * The measuring is the whole point: the displacement map is addressed in the
 * filtered element's own pixel space, so a hardcoded size misplaces the bevel and
 * quietly degrades to a flat blur. A `ResizeObserver` keeps the two in sync.
 *
 * Render `<LiquidGlassFilter id={filterId} {...filterProps} />` when `filterProps`
 * is non-null — the filter only has to exist in the document to be referenced.
 */
export function useLiquidGlass<T extends HTMLElement = HTMLDivElement>({
  depth = 8,
  blur = 2,
  strength = 75,
  chromaticAberration = 3,
  radius,
  brightness = 1.05,
  saturate = 1.15,
}: UseLiquidGlassOptions = {}) {
  const ref = useRef<T | null>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [pressed, setPressed] = useState(false);

  // `url(#…)` needs a bare CSS identifier, and useId() ships delimiter characters.
  const filterId = `liquid-glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const supported = detectSvgFilterSupport();

    // ResizeObserver delivers an initial observation, so this also covers mount.
    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);
      if (width === 0 || height === 0) return;

      setMeasurement((previous) =>
        previous?.width === width && previous?.height === height
          ? previous
          : { width, height, supported },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Releasing outside the element still has to clear the press, or the glass
  // stays stuck at its deeper setting.
  useEffect(() => {
    if (!pressed) return;

    const release = () => setPressed(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  const filterProps = useMemo(() => {
    if (!measurement?.supported) return null;

    return {
      width: measurement.width,
      height: measurement.height,
      radius: radius ?? measurement.height / 2,
      // Pressing widens the bevel so the glass visibly compresses, as in glass-element.js.
      depth: pressed ? depth / 0.7 : depth,
      strength,
      chromaticAberration,
    };
  }, [measurement, radius, pressed, depth, strength, chromaticAberration]);

  const style = useMemo(() => {
    const backdropFilter = filterProps
      ? `blur(${blur / 2}px) url(#${filterId}) blur(${blur}px) brightness(${brightness}) saturate(${saturate})`
      : `blur(${blur * 8}px)`;

    return { backdropFilter, WebkitBackdropFilter: backdropFilter };
  }, [filterProps, filterId, blur, brightness, saturate]);

  const press = useCallback(() => setPressed(true), []);

  return { ref, style, filterId, filterProps, press, pressed };
}
