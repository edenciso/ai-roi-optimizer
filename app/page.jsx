import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[80vh] grid place-items-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">AI Value & ROI Optimizer</h1>
        <p className="text-slate-600">
          A ready-to-run Next.js demo that visualizes AI program value, ROI, adoption, and reliability — with a built-in What‑If simulator.
        </p>
        <Link
          href="/ai-value-roi"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
        >
          Open Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
