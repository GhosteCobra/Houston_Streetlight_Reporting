"use client";
import { useEffect, useRef, useState } from "react";
import CameraCapture from "@/components/camera/CameraCapture";
import { issues, OFFICIAL_URL } from "@/lib/report/model";
import type { CenterPointPole } from "@/lib/server/centerpoint/adapter";

export default function ReportPreparation({ pole, onClose }: { pole: CenterPointPole; onClose: () => void }) {
  const section = useRef<HTMLElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [stage, setStage] = useState<"photo" | "details" | "review">("photo");
  const [issue, setIssue] = useState<(typeof issues)[number]>("Light out");
  const [description, setDescription] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => { section.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  const summary = `Streetlight outage report\nCenterPoint pole number: ${pole.facilityId ?? "Unknown"}\nLocation: ${pole.latitude.toFixed(6)}, ${pole.longitude.toFixed(6)}\nIssue: ${issue}\nDetails: ${description || "None provided"}\nPhoto: ${photo ? "Taken/selected in Streetlight Check; not sent to CenterPoint" : "Not provided"}`;
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopyStatus("Report details copied."); }
    catch { setCopyStatus("Copy unavailable. Select the report text below and copy it manually."); }
  }
  return <section className="centerpoint-detail cp-report" ref={section} aria-label="Prepare streetlight report">
    <div className="cp-report-heading"><h2>Report pole {pole.facilityId ?? "at this location"}</h2><button className="text-button" onClick={onClose}>Close</button></div>
    {stage === "photo" && <><CameraCapture photo={photo} onPhoto={setPhoto} onContinue={() => setStage("details")} onHeading={() => {}} /><button className="text-button" onClick={() => setStage("details")}>Continue without a photo</button></>}
    {stage === "details" && <form onSubmit={(e) => { e.preventDefault(); if (confirmed) setStage("review"); }}>
      {photo && <img className="cp-report-photo" src={photo} alt="Selected streetlight report photo" />}
      <label>Issue<select value={issue} onChange={(e) => setIssue(e.target.value as typeof issue)}>{issues.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Additional details<textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} /></label>
      <label className="cp-confirm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} required /> I confirm this pole and location match the streetlight I am reporting.</label>
      <div className="action-pair"><button type="button" className="secondary" onClick={() => setStage("photo")}>Back to photo</button><button className="primary" disabled={!confirmed}>Review report</button></div>
    </form>}
    {stage === "review" && <div>
      <h3>Ready for CenterPoint’s reporting form</h3>
      {photo && <img className="cp-report-photo" src={photo} alt="Reviewed streetlight report photo" />}
      <pre className="cp-summary">{summary}</pre>
      <p>Copy these details, then select the same pole in CenterPoint’s official form to submit. Nothing has been sent yet. Your photo stays in this page and is not transferred to CenterPoint; save your original photo before leaving.</p>
      <div className="action-pair"><button className="secondary" onClick={copy}>Copy report details</button><a className="primary" href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">Open official reporting form</a></div>
      <p role="status">{copyStatus}</p><button className="text-button" onClick={() => setStage("details")}>Edit details</button>
    </div>}
  </section>;
}
