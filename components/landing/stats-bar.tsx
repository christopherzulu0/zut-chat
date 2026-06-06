const STATS = [
  { value: "24/7", label: "Always available" },
  { value: "Official", label: "Document sources" },
  { value: "100%", label: "Cited answers" },
  { value: "Free", label: "For ZUT students" },
];

export function StatsBar() {
  return (
    <section className="border-y border-zinc-200/90 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-6 py-9 text-center ${i > 0 ? "border-l border-zinc-200/90" : ""}`}
          >
            <p className="text-2xl font-bold tracking-tight text-emerald-700">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
