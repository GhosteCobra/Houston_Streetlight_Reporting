"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, MapPin } from "lucide-react";
import { browserDemoStore } from "@/lib/demo-store";
import { issueLabels, type DemoReport } from "@shared/report";
export default function ReportsPage() {
  const [reports, setReports] = useState<DemoReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    browserDemoStore
      .list()
      .then(setReports)
      .catch(() =>
        setError(
          "Your saved reports could not be read. Browser storage may be unavailable.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <main id="main" className="page">
      <div className="page-heading">
        <div>
          <h1>My reports</h1>
          <p>Reports saved in this browser. Not sent to a utility.</p>
        </div>
        <Link href="/report" className="button navy compact-button">
          New report
          <ArrowRight size={18} />
        </Link>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading your reports…</p>
      ) : reports.length === 0 ? (
        <section className="empty-state">
          <FileText size={58} strokeWidth={1.4} />
          <h2>No reports yet</h2>
          <p>Your neighborhood starts with you.</p>
          <Link href="/report" className="button primary">
            Create a report
            <ArrowRight />
          </Link>
        </section>
      ) : (
        <div className="report-list">
          {reports.map((r) => (
            <article className="saved-report" key={r.report_id}>
              <div className="saved-icon">
                <FileText />
              </div>
              <div>
                <h2>{issueLabels[r.issue_type]}</h2>
                <p>
                  <MapPin size={16} />
                  {r.address ?? `${r.latitude}, ${r.longitude}`}
                </p>
                <code>{r.report_id}</code>
                <details>
                  <summary>View report details</summary>
                  <p>Streetlight: {r.pole_id ?? "Unknown pole"}</p>
                  <p>
                    Coordinates: {r.latitude}, {r.longitude}
                  </p>
                  <p>{r.description || "No additional description."}</p>
                  <p>Provider delivery: not sent</p>
                </details>
              </div>
              <div className="report-date">
                <span className="badge mint">Submitted · Demo</span>
                <time dateTime={r.reported_at}>
                  {new Date(r.reported_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="small-note">
        Local reports are not synced across devices and are removed if you clear
        your browser data.
      </p>
    </main>
  );
}
