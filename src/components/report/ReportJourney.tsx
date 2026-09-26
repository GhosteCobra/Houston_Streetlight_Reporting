"use client";
/* Selected local files use object URLs, not the Next image optimizer. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ImagePlus,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Tag,
  TriangleAlert,
  FileText,
} from "lucide-react";
import {
  demoPoles,
  issueLabels,
  possibleDuplicates,
  reportInputSchema,
  type DemoReport,
  type IssueType,
  type ReportInput,
} from "@shared/report";
import { browserDemoStore } from "@/lib/demo-store";
import { SampleMap } from "./SampleMap";

export function ReportJourney({ initialPole }: { initialPole?: string }) {
  const initial = demoPoles.find((p) => p.pole_id === initialPole);
  const [step, setStep] = useState<
    "photo" | "details" | "review" | "confirmation"
  >("photo");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [poleId, setPoleId] = useState(initial?.pole_id ?? "");
  const [latitude, setLatitude] = useState(
    initial ? String(initial.latitude) : "",
  );
  const [longitude, setLongitude] = useState(
    initial ? String(initial.longitude) : "",
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [source, setSource] = useState<"gps" | "manual">("manual");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [issue, setIssue] = useState<IssueType | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [duplicates, setDuplicates] = useState<DemoReport[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saved, setSaved] = useState<DemoReport | null>(null);
  const [copied, setCopied] = useState(false);
  const saveKey = useRef("");
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function clearPhoto() {
    setFile(null);
    setPreview("");
  }
  function chooseFile(value?: File) {
    setError("");
    if (!value) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(value.type)) {
      setError("Choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (value.size > 10 * 1024 * 1024) {
      setError("Choose a photo smaller than 10 MB.");
      return;
    }
    setFile(value);
    setPreview(URL.createObjectURL(value));
  }
  function selectPole(id: string) {
    setPoleId(id);
    setConfirmed(false);
    setSource("manual");
    setAccuracy(null);
    const p = demoPoles.find((p) => p.pole_id === id);
    if (p) {
      setLatitude(String(p.latitude));
      setLongitude(String(p.longitude));
      setAddress(p.address ?? "");
    }
  }
  function updateCoordinate(kind: "lat" | "lng", value: string) {
    (kind === "lat" ? setLatitude : setLongitude)(value);
    setConfirmed(false);
    setPoleId("");
    setSource("manual");
    setAccuracy(null);
  }
  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("Location is unavailable. Enter coordinates below.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLatitude(String(p.coords.latitude));
        setLongitude(String(p.coords.longitude));
        setSource("gps");
        setAccuracy(p.coords.accuracy);
        setPoleId("");
        setAddress("");
        setConfirmed(false);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError(
          "Location was unavailable or permission was declined. Enter coordinates or choose a sample pole.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  function input(): ReportInput | null {
    if (!latitude.trim() || !longitude.trim()) {
      setError("Enter latitude and longitude, or choose a sample pole.");
      return null;
    }
    if (!issue) {
      setError("Choose what is wrong with the streetlight.");
      return null;
    }
    const result = reportInputSchema.safeParse({
      pole_id: poleId || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address.trim() || null,
      location_source: source,
      location_accuracy_m: accuracy,
      location_confirmed: confirmed,
      issue_type: issue,
      description,
      captured_at: null,
      photo_path: null,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return null;
    }
    return result.data;
  }
  async function review() {
    setError("");
    const data = input();
    if (!data) return;
    setBusy(true);
    try {
      const reports = await browserDemoStore.list();
      setDuplicates(possibleDuplicates(data, reports));
      setAcknowledged(false);
      setStep("review");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to read local reports.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (saving.current) return;
    setError("");
    const data = input();
    if (!data) return;
    if (duplicates.length && !acknowledged) {
      setError(
        "Review the possible duplicate and confirm you want to save another report.",
      );
      return;
    }
    saving.current = true;
    setBusy(true);
    try {
      if (!saveKey.current) saveKey.current = crypto.randomUUID();
      const report = await browserDemoStore.save(data, saveKey.current);
      setSaved(report);
      setStep("confirmation");
    } catch {
      setError(
        "We could not save this report on your device. Your draft is still here. Enable browser storage and try again.",
      );
    } finally {
      setBusy(false);
      saving.current = false;
    }
  }
  const title = {
    photo: "New report",
    details: "Tell us what you found",
    review: "Review your streetlight",
    confirmation: "Report saved",
  }[step];
  const selectedPole = demoPoles.find((p) => p.pole_id === poleId);
  return (
    <main
      id="main"
      className={`page report-page ${step === "confirmation" ? "confirmation-page" : ""}`}
    >
      <div className="page-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {title}
          </h1>
          <p>
            {step === "photo"
              ? "A small action for a brighter neighborhood."
              : step === "details"
                ? "Confirm the location and describe the issue."
                : step === "review"
                  ? "Check the details below before saving your report."
                  : "Thank you for looking out for your neighborhood."}
          </p>
        </div>
        <span className="badge lavender">Local demo</span>
      </div>
      {step !== "confirmation" && (
        <ol className="progress" aria-label="Report progress">
          {["Photo", "Details", "Review"].map((label, i) => {
            const current = ["photo", "details", "review"].indexOf(step);
            return (
              <li
                key={label}
                className={i <= current ? "active" : ""}
                aria-current={i === current ? "step" : undefined}
              >
                <span>{i < current ? <Check size={16} /> : i + 1}</span>
                {label}
              </li>
            );
          })}
        </ol>
      )}
      {error && (
        <div role="alert" className="error-message">
          <TriangleAlert size={20} />
          {error}
        </div>
      )}
      {step === "photo" && (
        <div className="capture-layout">
          <div>
            <div className={`photo-zone ${preview ? "has-photo" : ""}`}>
              {preview ? (
                <>
                  {/* Object URL stays local; native img is required for selected files. */}
                  <img
                    src={preview}
                    alt="Selected streetlight photo"
                    onError={() => {
                      clearPhoto();
                      setError(
                        "This photo could not be opened. Choose another photo or continue without one.",
                      );
                    }}
                  />
                </>
              ) : (
                <div className="capture-empty">
                  <Camera size={58} strokeWidth={1.3} />
                  <h2>Start with a photo</h2>
                  <p>
                    Include the whole pole and light.
                    <br />
                    Keep a safe distance from damaged equipment.
                  </p>
                </div>
              )}
              <div className="photo-controls">
                <label className="photo-control">
                  <ImagePlus />
                  <span>{file ? "Replace photo" : "Upload photo"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      chooseFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <label className="shutter" aria-label="Take a photo">
                  <Camera />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(e) => {
                      chooseFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {file ? (
                  <button className="photo-control" onClick={clearPhoto}>
                    Remove
                  </button>
                ) : (
                  <span className="photo-hint">
                    JPG, PNG, WebP
                    <br />
                    Up to 10 MB
                  </span>
                )}
              </div>
            </div>
            <div className="tip">
              <Camera size={23} />
              Include the whole pole and light in the photo
            </div>
          </div>
          <aside className="capture-aside">
            <h2>Let&apos;s find your streetlight</h2>
            <p>
              A photo helps you review the problem. Next, you&apos;ll confirm
              the location and choose an issue.
            </p>
            <button
              className="button navy w-full"
              onClick={() => {
                setError("");
                setStep("details");
              }}
            >
              {file ? "Use photo" : "Continue without photo"}
              <ArrowRight />
            </button>
            <p className="small-note">
              <MapPin size={17} />
              Location added after photo
            </p>
            <div className="notice">
              <ShieldCheck />
              <p>
                This demo keeps your photo in this tab for preview only. It does
                not upload or save the photo.
              </p>
            </div>
          </aside>
        </div>
      )}
      {step === "details" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void review();
          }}
          className="details-layout"
        >
          <section className="panel">
            <h2>
              <MapPin />
              Where is the streetlight?
            </h2>
            <label>
              Streetlight
              <select
                value={poleId}
                onChange={(e) => selectPole(e.target.value)}
              >
                <option value="">Unknown pole / manual location</option>
                {demoPoles.map((p) => (
                  <option key={p.pole_id} value={p.pole_id}>
                    {p.pole_id} · {p.address}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button secondary compact-button"
              onClick={locate}
              disabled={locating}
            >
              <LocateFixed size={19} />
              {locating ? "Finding location…" : "Use my location"}
            </button>
            <div className="field-pair">
              <label>
                Latitude
                <input
                  inputMode="decimal"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => updateCoordinate("lat", e.target.value)}
                  required
                  placeholder="29.7604"
                />
              </label>
              <label>
                Longitude
                <input
                  inputMode="decimal"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => updateCoordinate("lng", e.target.value)}
                  required
                  placeholder="-95.3698"
                />
              </label>
            </div>
            <label>
              Address or nearby landmark{" "}
              <span className="optional">(optional)</span>
              <input
                value={address}
                maxLength={300}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setConfirmed(false);
                }}
                placeholder="Street name or nearest intersection"
              />
            </label>
            {accuracy !== null && (
              <p className="small-note">
                GPS accuracy: approximately {Math.round(accuracy)} m. Check the
                location.
              </p>
            )}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I confirm these coordinates identify the affected streetlight.
            </label>
            <p className="small-note">
              Sample poles are fictional. For an older photo, confirm where it
              was taken.
            </p>
          </section>
          <section className="panel">
            <h2>What&apos;s the issue?</h2>
            <fieldset className="issue-grid">
              <legend className="sr-only">Select an issue</legend>
              {Object.entries(issueLabels).map(([key, label]) => (
                <label
                  key={key}
                  className={`issue-option ${issue === key ? "checked" : ""}`}
                >
                  <input
                    type="radio"
                    name="issue"
                    value={key}
                    checked={issue === key}
                    onChange={() => setIssue(key as IssueType)}
                    required
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            {["pole_damaged", "pole_leaning", "exposed_wires"].includes(
              issue ?? "",
            ) && (
              <div className="notice warning">
                <TriangleAlert />
                <p>
                  Stay away from damaged equipment and wires. For immediate
                  danger, call emergency services. This demo is not an emergency
                  service.
                </p>
              </div>
            )}
            <label>
              Anything else? <span className="optional">(optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="For example, the light flickers after sunset."
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setError("");
                  setStep("photo");
                }}
              >
                <ArrowLeft size={18} />
                Photo
              </button>
              <button className="button navy" disabled={busy}>
                {busy ? "Checking…" : "Review report"}
                <ArrowRight size={19} />
              </button>
            </div>
          </section>
        </form>
      )}
      {step === "review" && (
        <>
          <section className="review-card">
            <div className="review-photo">
              {preview ? (
                <img src={preview} alt="Your streetlight photo" />
              ) : (
                <div className="capture-empty">
                  <Camera size={46} />
                  <p>No photo attached</p>
                </div>
              )}
            </div>
            <div className="review-details">
              <h2>Streetlight details</h2>
              <p className="muted">
                Location confirmed by you. No automatic match was performed.
              </p>
              <dl>
                <div>
                  <Tag />
                  <dt>Streetlight ID</dt>
                  <dd>{poleId || "Unknown pole"}</dd>
                </div>
                <div>
                  <MapPin />
                  <dt>Location</dt>
                  <dd>
                    {address || "Manual coordinates"}
                    <small>
                      {latitude}, {longitude}
                    </small>
                  </dd>
                </div>
                <div>
                  <FileText />
                  <dt>Issue</dt>
                  <dd>
                    {issue ? issueLabels[issue] : ""}
                    {description && <small>{description}</small>}
                  </dd>
                </div>
              </dl>
              {selectedPole && (
                <SampleMap poles={[selectedPole]} selected={poleId} compact />
              )}
            </div>
          </section>
          {duplicates.length > 0 && (
            <section className="notice warning duplicate-notice">
              <TriangleAlert />
              <div>
                <h2>Possible duplicate report</h2>
                <p>
                  You have {duplicates.length} recent report(s) for this issue
                  near this location.
                </p>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  I reviewed this and want to save another report.
                </label>
              </div>
            </section>
          )}
          <section className="submission-card">
            <ShieldCheck size={44} />
            <div>
              <p className="muted">Submission destination</p>
              <h2>This device · Demo only</h2>
              <p>
                Your report details will be saved in this browser. Nothing is
                sent to CenterPoint Energy or another utility. Photos are not
                saved.
              </p>
              <span className="badge mint">
                <Check size={16} />
                Ready to save locally
              </span>
            </div>
            <button
              className="button navy"
              disabled={busy || (duplicates.length > 0 && !acknowledged)}
              onClick={save}
            >
              {busy ? "Saving…" : "Save demo report"}
              <ArrowRight />
            </button>
          </section>
          <button
            className="text-link back-link"
            onClick={() => {
              setError("");
              setStep("details");
            }}
          >
            <ArrowLeft size={18} />
            Edit report details
          </button>
        </>
      )}
      {step === "confirmation" && saved && (
        <section className="confirmation panel">
          <div className="success-icon">
            <CheckCircle2 size={52} />
          </div>
          <h2>Your demo report is saved</h2>
          <p>Saved on this device. Not sent to a utility.</p>
          <label>
            Internal report number
            <output className="report-number">{saved.report_id}</output>
          </label>
          <div className="confirmation-summary">
            <strong>{issueLabels[saved.issue_type]}</strong>
            <p>{saved.address ?? `${saved.latitude}, ${saved.longitude}`}</p>
            <span className="badge mint">Submitted · Local demo</span>
          </div>
          <p className="muted">
            You can copy a summary to use with the official reporting process. A
            utility has not received this report.
          </p>
          <button
            className="button secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `Streetlight issue: ${issueLabels[saved.issue_type]}\nPole: ${saved.pole_id ?? "Unknown"}\nLocation: ${saved.address ?? ""} (${saved.latitude}, ${saved.longitude})\n${saved.description}\nLocal demo ${saved.report_id}. Not sent to a utility.`,
                );
                setCopied(true);
              } catch {
                setError(
                  "Copy is unavailable in this browser. Select the details above to copy manually.",
                );
              }
            }}
          >
            {copied ? "Summary copied" : "Copy report summary"}
          </button>
          <Link className="button navy" href="/reports">
            View my reports
            <ArrowRight />
          </Link>
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </section>
      )}
    </main>
  );
}
