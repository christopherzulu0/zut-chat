export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
      {children}
    </p>
  );
}
