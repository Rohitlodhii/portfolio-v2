export function Screenshot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return <figure className="my-7">
    <div className="overflow-hidden rounded-lg border border-border bg-muted/30"><img src={src} alt={alt} loading="lazy" className="h-auto w-full" /></div>
    {caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>}
  </figure>;
}
