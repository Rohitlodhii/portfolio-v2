"use client";

import { getDisplacementMap } from "@/lib/glass/displacement";

export interface LiquidGlassFilterProps {
  /** Referenced from `backdrop-filter: url(#id)`. Must be unique per instance. */
  id: string;
  width: number;
  height: number;
  radius: number;
  depth: number;
  strength: number;
  chromaticAberration: number;
}

/**
 * Renders the displacement filter as a live element in the document.
 *
 * Deliberately not inlined into `backdrop-filter` as a `data:` URI: Chromium
 * resolves that form on first paint but can fail to re-resolve it when the
 * backdrop is re-rasterized, silently dropping to just the `blur()` functions in
 * the filter list. A filter that lives in the DOM and is referenced by fragment
 * id survives those repaints.
 *
 * The three `feDisplacementMap` passes exist only for chromatic aberration: each
 * samples at a slightly different scale, is masked to one channel by the matrix
 * that follows it, then screened back together. Set `chromaticAberration` to 0 to
 * collapse the prism fringe.
 */
export function LiquidGlassFilter({
  id,
  width,
  height,
  radius,
  depth,
  strength,
  chromaticAberration,
}: LiquidGlassFilterProps) {
  const map = getDisplacementMap({ width, height, radius, depth });

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Zero-sized but still rendered — a display:none subtree is not a reliable
      // place to keep a referenced filter.
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feImage
            x="0"
            y="0"
            width={width}
            height={height}
            href={map}
            result="displacementMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength + chromaticAberration * 2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedR"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength + chromaticAberration}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedG"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={strength}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="displacedB"
          />
          <feBlend in="displacedR" in2="displacedG" mode="screen" />
          <feBlend in2="displacedB" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
