/**
 * SVG displacement map for the liquid-glass effect.
 *
 * Typed port of the map half of `lib/glass/displacement-util.js`, which is a
 * vanilla script that assigns to `window.DisplacementUtils` and so cannot be
 * imported from a module.
 *
 * The map is a raster where the red channel drives horizontal displacement and
 * the green channel drives vertical displacement, with 0x80 meaning "no shift".
 * A neutral rounded rect inset by `depth` flattens the centre, leaving only a
 * `depth`-wide ring around the edge that refracts — that ring is what reads as a
 * glass bevel.
 *
 * `width`/`height` are CSS pixels of the element being filtered, because the
 * consuming `feImage` uses the default `primitiveUnits="userSpaceOnUse"`. A map
 * generated at the wrong size puts the bevel somewhere other than the visual edge.
 */

export interface DisplacementMapOptions {
  height: number;
  width: number;
  radius: number;
  depth: number;
}

export function getDisplacementMap({
  height,
  width,
  radius,
  depth,
}: DisplacementMapOptions) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
          .mix { mix-blend-mode: screen; }
      </style>
      <defs>
          <linearGradient
            id="Y"
            x1="0"
            x2="0"
            y1="${Math.ceil((radius / height) * 15)}%"
            y2="${Math.floor(100 - (radius / height) * 15)}%">
              <stop offset="0%" stop-color="#0F0" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
          <linearGradient
            id="X"
            x1="${Math.ceil((radius / width) * 15)}%"
            x2="${Math.floor(100 - (radius / width) * 15)}%"
            y1="0"
            y2="0">
              <stop offset="0%" stop-color="#F00" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
      </defs>

      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
      <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect
            x="0"
            y="0"
            height="${height}"
            width="${width}"
            fill="url(#Y)"
            class="mix"
        />
        <rect
            x="0"
            y="0"
            height="${height}"
            width="${width}"
            fill="url(#X)"
            class="mix"
        />
        <rect
            x="${depth}"
            y="${depth}"
            height="${height - 2 * depth}"
            width="${width - 2 * depth}"
            fill="#808080"
            rx="${radius}"
            ry="${radius}"
            filter="blur(${depth}px)"
        />
      </g>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
