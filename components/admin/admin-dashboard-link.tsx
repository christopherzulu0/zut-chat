import Link from "next/link";

export function AdminDashboardLink() {
  return (
    <Link
      href="/admin"
      className="rounded-full border border-emerald-300 bg-white px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50"
    >
      Admin dashboard
    </Link>
  );
}
