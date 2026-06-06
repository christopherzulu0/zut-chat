/** Decorative grid used on landing sections */
export function LandingGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      aria-hidden
    />
  );
}

export function LandingOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      aria-hidden
    />
  );
}
