"use client";

import dynamic from "next/dynamic";

/**
 * The report reads localStorage for the PIN and formats timestamps in the
 * viewer's locale, so server-rendering it only produces markup the client
 * immediately disagrees with. Render it in the browser and nowhere else.
 */
const ReportBody = dynamic(() => import("./ReportBody"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white/40">Loading…</div>
  ),
});

export default function ReportPage() {
  return <ReportBody />;
}
