export function TopScrollBlur() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-[-24px] z-50 h-24 bg-gradient-to-b from-background via-background/60 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0.85)_25%,rgba(0,0,0,0.5)_55%,rgba(0,0,0,0.15)_80%,rgba(0,0,0,0)_100%)]"
    />
  );
}
