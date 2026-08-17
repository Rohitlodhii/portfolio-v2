import NextImage from "next/image";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  caption?: string;
}

export function Image({ src, alt, width, height, priority = false, caption }: ImageProps) {
  return (
    <figure className="my-7">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <NextImage
          src={src}
          alt={alt}
          width={width ?? 1200}
          height={height ?? 675}
          priority={priority}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
