"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Camera,
  Map as MapIcon,
  ClipboardList,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  LocateFixed,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Compass,
  LoaderCircle,
  ImagePlus,
} from "lucide-react";
import Brand from "./Brand";
import CameraCapture from "../camera/CameraCapture";
import StreetlightSuggestion from "./StreetlightSuggestion";
import DesktopUpload from "./DesktopUpload";
import {
  coordinateSchema,
  HOUSTON,
  OFFICIAL_URL,
  issues,
  type Coordinates,
  type Location,
  type Pole,
  type Draft,
} from "@/lib/report/model";
import { poleAdapter, rankPoles } from "@/lib/arcgis/poles";
import { listDrafts, saveDraft, deleteDraft } from "@/lib/report/storage";
const StreetlightMap = dynamic(() => import("../map/StreetlightMap"), {
  ssr: false,
  loading: () => (
    <div className="map-shell map-loading">Loading map tools…</div>
  ),
});
type Tab = "report" | "map" | "reports";
type Step = "photo" | "location" | "review" | "saved";
export default function StreetlightApp() {
  const [tab, setTab] = useState<Tab>("report"),
    [step, setStep] = useState<Step>("photo"),
    [photo, setPhoto] = useState<string | null>(null),
    [location, setLocation] = useState<Location | null>({
      ...HOUSTON,
      source: "demo",
      accuracy: null,
      address: "",
    }),
    [pole, setPole] = useState<Pole | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [poles, setPoles] = useState<Pole[]>([]),
    [poleLoading, setPoleLoading] = useState(false),
    [poleError, setPoleError] = useState(""),
    [lookupAttempt, setLookupAttempt] = useState(0),
    [locationLoading, setLocationLoading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [number, setNumber] = useState(""),
    [heading, setHeading] = useState<number | null>(null),
    [useHeading, setUseHeading] = useState(false),
    [issue, setIssue] = useState<(typeof issues)[number]>("Light out"),
    [description, setDescription] = useState(""),
    [drafts, setDrafts] = useState<Draft[]>([]),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState<Draft | null>(null),
    [id, setId] = useState<string | null>(null),
    [lat, setLat] = useState(""),
    [lon, setLon] = useState(""),
    [address, setAddress] = useState("");
  const request = useRef(0),
    saveLock = useRef(false),
    candidateList = useRef<HTMLHeadingElement>(null),
    fallbackOptions = useRef<HTMLDetailsElement>(null),
    alternativeList = useRef<HTMLDetailsElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  const refresh = useCallback(async () => {
    try {
      setDrafts(await listDrafts());
    } catch {
      setNotice(
        "Local draft storage is unavailable in this browser. You can still prepare a report.",
      );
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    title.current?.focus();
    if (fallbackOptions.current) fallbackOptions.current.open = false;
    if (alternativeList.current) alternativeList.current.open = false;
  }, [step, tab]);
  useEffect(() => {
    return () => {
      request.current++;
    };
  }, []);
  useEffect(() => {
    if (!location) {
      setPoles([]);
      setPoleLoading(false);
      setPoleError("");
      return;
    }
    const controller = new AbortController();
    setPoleLoading(true);
    setPoleError("");
    setPoles([]);
    poleAdapter
      .nearby(location, controller.signal)
      .then((nextPoles) => {
        if (!controller.signal.aborted) setPoles(nextPoles);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setPoleError(
            "Streetlight lookup failed. Try again or confirm a manual pin.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setPoleLoading(false);
      });
    return () => controller.abort();
  }, [location?.latitude, location?.longitude, lookupAttempt]);
  const changeLocation = useCallback(
    (
      point: Coordinates,
      source: Location["source"] = "manual",
      accuracy: number | null = null,
    ) => {
      request.current++;
      setLocationLoading(false);
      setLocation({ ...point, accuracy, source, address: "" });
      setPoles([]);
      setPoleLoading(true);
      setPoleError("");
      setLookupAttempt((attempt) => attempt + 1);
      setPole(null);
      setConfirmed(false);
      setLat(point.latitude.toFixed(6));
      setLon(point.longitude.toFixed(6));
      setError("");
    },
    [],
  );
  async function locate() {
    request.current++;
    setLocation(null);
    setPoles([]);
    setPole(null);
    setConfirmed(false);
    setError("");
    setNotice("");
    if (!navigator.geolocation || !window.isSecureContext) {
      setError(
        "Location needs HTTPS or localhost. Enter coordinates or select a map pin instead.",
      );
      return;
    }
    const token = ++request.current;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (token !== request.current) return;
        changeLocation(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          "gps",
          pos.coords.accuracy,
        );
      },
      (failure) => {
        if (token !== request.current) return;
        setLocationLoading(false);
        setError(
          failure.code === 1
            ? "We could not get your location: location permission was denied. Allow location in browser settings, or choose a point manually below."
            : failure.code === 3
              ? "Location lookup timed out. Try again or choose a point manually below."
              : "Your location is unavailable. Try again or choose a point manually below.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }
  function choosePole(value: string) {
    if (poleLoading || locationLoading) return;
    const chosen = poles.find((p) => p.id === value);
    if (!chosen) return;
    setPole(chosen);
    setConfirmed(true);
    setError("");
  }
  function confirmPin() {
    if (!location) return;
    setPole(null);
    setConfirmed(true);
    setError("");
  }
  function setCoordinates() {
    const result = coordinateSchema.safeParse({
      latitude: lat.trim() ? Number(lat) : NaN,
      longitude: lon.trim() ? Number(lon) : NaN,
    });
    if (!result.success) {
      setError(
        "Enter a valid latitude (−90 to 90) and longitude (−180 to 180).",
      );
      return;
    }
    changeLocation(result.data);
  }
  function reset() {
    request.current++;
    setLocationLoading(false);
    setPhoto(null);
    setLocation(null);
    setPole(null);
    setConfirmed(false);
    setAddress("");
    setNumber("");
    setHeading(null);
    setUseHeading(false);
    setDescription("");
    setIssue("Light out");
    setId(null);
    setSaved(null);
    setStep("photo");
    setTab("report");
    setError("");
    setNotice("");
  }
  function edit(d: Draft) {
    request.current++;
    setLocationLoading(false);
    setPhoto(d.photo);
    setLocation(d.location);
    setAddress(d.location.address);
    setLat(d.location.latitude.toFixed(6));
    setLon(d.location.longitude.toFixed(6));
    setPole(d.poleId ? { id: d.poleId, ...d.location, source: "demo" } : null);
    setConfirmed(true);
    setIssue(d.issue);
    setDescription(d.description);
    setNumber(d.poleNumberEvidence);
    setHeading(d.heading);
    setUseHeading(d.heading !== null);
    setId(d.id);
    setStep("review");
    setTab("report");
    setError("");
  }
  async function save() {
    if (saveLock.current) return;
    if (!location || !confirmed) {
      setError("Confirm a pole or map location first.");
      return;
    }
    saveLock.current = true;
    setSaving(true);
    setError("");
    const draft: Draft = {
      id: id ?? crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      photo,
      location: {
        ...location,
        ...(pole ? { latitude: pole.latitude, longitude: pole.longitude } : {}),
        address: address.trim(),
      },
      poleId: pole?.id ?? null,
      issue,
      description: description.trim(),
      status: "draft",
      providerDelivery: "not_sent",
      dataSource: "demo",
      poleNumberEvidence: number,
      heading: useHeading ? heading : null,
    };
    try {
      await saveDraft(draft);
      setId(draft.id);
      setSaved(draft);
      setStep("saved");
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("20 drafts")
          ? e.message
          : "We could not save on this device. Storage may be full or blocked. Your report is still here; free space and try again.",
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }
  const candidates = location
    ? rankPoles(
        poles,
        location,
        number,
        useHeading ? heading : null,
        location.accuracy,
      )
    : [];
  const sectionTitle =
    tab === "reports"
      ? "Saved"
      : tab === "map"
        ? "Find a streetlight"
        : step === "photo"
          ? "Report a streetlight"
          : step === "location"
            ? "Confirm the streetlight"
            : step === "review"
              ? "Review your report"
              : "Draft saved";
  const showMap =
    tab === "map" ||
    (tab === "report" && (step === "photo" || step === "location"));
  return (
    <div
      className={`app ${showMap ? "app-map" : ""} ${tab === "report" ? "app-report" : ""} ${tab === "report" && step === "photo" ? "app-start" : ""}`}
    >
      <Brand />
      <main className="workspace" id="capture" tabIndex={-1}>
        <div className="section-heading">
          <span className="heading-icon">
            {tab === "reports" ? (
              <ClipboardList />
            ) : tab === "map" || step === "location" ? (
              <MapPin />
            ) : step === "saved" ? (
              <Check />
            ) : (
              <Camera />
            )}
          </span>
          <div>
            <h1 ref={title} tabIndex={-1}>
              {sectionTitle}
            </h1>
            {tab === "report" && step === "photo" && (
              <p className="section-subtitle">
                Start with a location or add a photo.
              </p>
            )}
          </div>
        </div>
        {tab === "report" && step !== "saved" && (
          <ol className="steps" aria-label="Report progress">
            {["Photo", "Location", "Review"].map((label, i) => (
              <li
                key={label}
                className={
                  i === ["photo", "location", "review"].indexOf(step)
                    ? "current"
                    : i < ["photo", "location", "review"].indexOf(step)
                      ? "done"
                      : ""
                }
              >
                <span>{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        )}
        {notice && (
          <p role="status" className="info">
            {notice}
          </p>
        )}
        {tab === "report" && step === "photo" && (
          <div className="mobile-capture">
            <CameraCapture
              photo={photo}
              onPhoto={(p) => {
                request.current++;
                setLocationLoading(false);
                setPhoto(p);
                setLocation(null);
                setPoles([]);
                setPole(null);
                setConfirmed(false);
                if (!p) {
                  setHeading(null);
                  setUseHeading(false);
                }
              }}
              onHeading={(h) => {
                setHeading(h);
                setUseHeading(false);
              }}
              onContinue={() => {
                setStep("location");
                locate();
              }}
            />
            <button
              className="text-button"
              onClick={() => {
                setPhoto(null);
                setHeading(null);
                setUseHeading(false);
                setStep("location");
                setError("");
              }}
            >
              Continue without a photo
            </button>
            <p className="quiet-note">
              <ShieldCheck size={14} />
              Your photo stays on this device. Use the camera only when safely
              stopped.
            </p>
          </div>
        )}
        {showMap && (
          <div className="location-content">
            <div className="demo-banner">
              <div>
                <strong>Sample map</strong>
                <p>Demo poles. No utility data is connected.</p>
              </div>
              <a
                className="provider-map-link"
                href="https://sora.centerpointenergy.com/HOU_Sloreporting/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CenterPoint map <ExternalLink size={14} />
              </a>
            </div>
            {tab === "report" && (
              <div className="action-pair location-actions">
                <button
                  className="primary"
                  onClick={locate}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <LoaderCircle className="spin" size={17} />
                  ) : (
                    <LocateFixed size={17} />
                  )}{" "}
                  {locationLoading ? "Finding you…" : "Use my current location"}
                </button>
                <button
                  className="secondary"
                  onClick={() => changeLocation(HOUSTON, "demo")}
                >
                  Reset map to Houston
                </button>
              </div>
            )}
            {photo && (
              <p className="field-help">
                GPS uses your current location, not the location in the photo.
                If the photo was taken elsewhere, choose that location manually.
              </p>
            )}
            {locationLoading && (
              <p role="status">Finding your current location…</p>
            )}
            {poleLoading && (
              <p role="status">Looking up nearby streetlights…</p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {poleError && (
              <div className="error" role="alert">
                <p>{poleError}</p>
                <button
                  className="secondary"
                  onClick={() => setLookupAttempt((attempt) => attempt + 1)}
                >
                  Retry streetlight lookup
                </button>
              </div>
            )}
            {location?.accuracy !== null &&
              location?.accuracy !== undefined && (
                <p className="info">
                  GPS accuracy: about ±{Math.round(location.accuracy)} m.
                  Confirm the side of the street yourself.
                </p>
              )}
            <div className={`map-layout ${tab === "map" ? "map-only" : ""}`}>
              <StreetlightMap
                location={location ?? HOUSTON}
                poles={poles}
                selected={pole?.id ?? null}
                onPin={(point) => changeLocation(point)}
                onPole={choosePole}
                interactive={tab === "report"}
              />
              {tab === "map" ? (
                <button
                  className="primary map-start-button"
                  onClick={() => {
                    setTab("report");
                    setStep(photo ? "location" : "photo");
                  }}
                >
                  {photo ? "Continue report" : "Start a report"}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <div className="map-controls">
                  {tab === "report" &&
                    (step === "photo" || step === "location") && (
                      <DesktopUpload
                        photo={photo}
                        onPhoto={(next) => {
                          request.current++;
                          setPhoto(next);
                          setPole(null);
                          setConfirmed(false);
                          setHeading(null);
                          setUseHeading(false);
                        }}
                        onContinue={() => {
                          setStep("location");
                          locate();
                        }}
                      />
                    )}
                  {!locationLoading &&
                    !poleLoading &&
                    !poleError &&
                    !confirmed &&
                    tab === "report" &&
                    !!photo &&
                    candidates[0] && (
                      <StreetlightSuggestion
                        candidate={candidates[0]}
                        onConfirm={() => choosePole(candidates[0].id)}
                        onChooseAnother={() => {
                          if (fallbackOptions.current)
                            fallbackOptions.current.open = true;
                          if (alternativeList.current)
                            alternativeList.current.open = true;
                          candidateList.current?.scrollIntoView({
                            block: "center",
                          });
                          candidateList.current?.focus({ preventScroll: true });
                        }}
                      />
                    )}
                  {tab === "report" && step === "location" && (
                    <details className="fallback-options" ref={fallbackOptions}>
                      <summary>Need to correct the location or pole?</summary>
                      <details className="manual-options">
                        <summary>Adjust location</summary>
                        <div className="manual-location">
                          <label>
                            Nearby address or intersection{" "}
                            <span>(optional note)</span>
                            <input
                              value={address}
                              maxLength={300}
                              placeholder="e.g. Main St & Texas Ave"
                              onChange={(e) => {
                                setAddress(e.target.value);
                                setConfirmed(false);
                              }}
                            />
                          </label>
                          <p className="field-help">
                            Addresses are notes only, not geocoded. Tap the map
                            or enter coordinates to place the pin.
                          </p>
                          <details>
                            <summary>Enter coordinates instead</summary>
                            <div className="coordinate-fields">
                              <label>
                                Latitude
                                <input
                                  inputMode="decimal"
                                  value={lat}
                                  onChange={(e) => {
                                    setLat(e.target.value);
                                    setConfirmed(false);
                                  }}
                                  placeholder="29.760400"
                                />
                              </label>
                              <label>
                                Longitude
                                <input
                                  inputMode="decimal"
                                  value={lon}
                                  onChange={(e) => {
                                    setLon(e.target.value);
                                    setConfirmed(false);
                                  }}
                                  placeholder="-95.369800"
                                />
                              </label>
                            </div>
                            <button
                              className="secondary"
                              onClick={setCoordinates}
                            >
                              Set these coordinates
                            </button>
                          </details>
                        </div>
                      </details>
                      {location && (
                        <>
                          <details className="number-options">
                            <summary>Enter a pole number</summary>
                            <div className="number-evidence">
                              <label>
                                Pole number <span>(optional)</span>
                                <input
                                  value={number}
                                  maxLength={80}
                                  onChange={(e) => setNumber(e.target.value)}
                                  placeholder="Number visible on the pole"
                                />
                              </label>
                              <p className="field-help">
                                Optional. Used to match the sample pole list.
                              </p>
                              {heading !== null && (
                                <label className="check-row">
                                  <input
                                    type="checkbox"
                                    checked={useHeading}
                                    onChange={(e) =>
                                      setUseHeading(e.target.checked)
                                    }
                                  />
                                  <Compass size={16} />
                                  Use approximate camera direction (
                                  {Math.round(heading)}°). It may be inaccurate.
                                </label>
                              )}
                            </div>
                          </details>
                          <details
                            className="other-poles"
                            ref={alternativeList}
                          >
                            <summary>Choose a different streetlight</summary>
                            <div className="candidates-heading">
                              <h2 ref={candidateList} tabIndex={-1}>
                                Other streetlights
                              </h2>
                              <span></span>
                            </div>
                            <p className="field-help">
                              {number.trim() &&
                              !candidates.some((p) => p.numberMatch)
                                ? "No demo pole matches that number. "
                                : " "}
                              Select a marker or another sample pole.
                            </p>
                            {poleLoading ? (
                              <p role="status" className="loading">
                                <LoaderCircle className="spin" size={18} />
                                Finding demo candidates…
                              </p>
                            ) : candidates.length ? (
                              <div className="candidate-list">
                                {candidates.map((p, i) => (
                                  <button
                                    key={p.id}
                                    className={
                                      "candidate " +
                                      (pole?.id === p.id && confirmed
                                        ? "selected"
                                        : "")
                                    }
                                    onClick={() => choosePole(p.id)}
                                    aria-pressed={
                                      pole?.id === p.id && confirmed
                                    }
                                  >
                                    <span className="candidate-number">
                                      {i + 1}
                                    </span>
                                    <span className="candidate-info">
                                      <strong>
                                        {p.id} <small>DEMO</small>
                                      </strong>
                                      <span>{p.address}</span>
                                      <span>
                                        {p.latitude.toFixed(5)},{" "}
                                        {p.longitude.toFixed(5)} · {p.reason}
                                      </span>
                                    </span>
                                    <span className="candidate-distance">
                                      {Math.round(p.distance)} m
                                      {pole?.id === p.id && confirmed ? (
                                        <Check size={19} />
                                      ) : (
                                        <ChevronRight size={18} />
                                      )}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : !poleError ? (
                              <p className="info">
                                No sample poles within 750 m of this location.
                                Confirm your manual pin, or explore the demo
                                area.
                              </p>
                            ) : null}
                          </details>
                          <button
                            className={
                              "manual-pin " +
                              (confirmed && !pole ? "selected" : "")
                            }
                            onClick={confirmPin}
                          >
                            <MapPin size={20} />
                            <span>
                              Confirm this map pin
                              <small>
                                {location.latitude.toFixed(6)},{" "}
                                {location.longitude.toFixed(6)}
                              </small>
                            </span>
                            {confirmed && !pole && <Check size={20} />}
                          </button>
                        </>
                      )}
                    </details>
                  )}
                  {confirmed && (
                    <p role="status" className="success">
                      <Check size={18} />
                      {pole
                        ? `${pole.id} selected. Demo data only.`
                        : "Manual location confirmed. Pole ID unknown."}
                    </p>
                  )}
                </div>
              )}
            </div>
            {tab === "report" ? (
              <div className="step-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    request.current++;
                    setLocationLoading(false);
                    setStep("photo");
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} />
                  Photo
                </button>
                <button
                  className="primary"
                  disabled={!confirmed || !location}
                  onClick={() => {
                    setStep("review");
                    setError("");
                  }}
                >
                  Review report
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : null}
          </div>
        )}
        {tab === "report" && step === "review" && location && (
          <div className="review-content">
            <div className="review-photo">
              {photo ? (
                <img src={photo} alt="Photo to include with your draft" />
              ) : (
                <p>No photo attached</p>
              )}
              <button
                className="glass-button"
                onClick={() => setStep("photo")}
                aria-label="Edit photo"
              >
                <ImagePlus size={21} />
              </button>
            </div>
            <div className="review-location">
              <MapPin />
              <div>
                <strong>
                  {pole?.id ?? "Manual location · pole ID unknown"}
                </strong>
                <p>{address || pole?.address || "Address not provided"}</p>
                <small>
                  {(pole?.latitude ?? location.latitude).toFixed(6)},{" "}
                  {(pole?.longitude ?? location.longitude).toFixed(6)} ·{" "}
                  {pole ? "Demo pole" : "Confirmed pin"}
                </small>
              </div>
              <button
                className="text-button"
                onClick={() => setStep("location")}
              >
                Edit
              </button>
            </div>
            <label>
              What needs attention?
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value as typeof issue)}
              >
                {issues.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </label>
            {["Exposed wires", "Leaning pole", "Damaged pole"].includes(
              issue,
            ) && (
              <p className="error">
                Stay clear of damaged equipment. If there is immediate danger,
                contact emergency services; this draft is not an emergency
                report.
              </p>
            )}
            <label>
              Anything else we should know? <span>(optional)</span>
              <textarea
                value={description}
                maxLength={2000}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what you noticed…"
              />
            </label>
            <div className="draft-notice">
              <ShieldCheck size={22} />
              <p>
                <strong>This saves a draft on your device.</strong> We cannot
                send reports to CenterPoint. You can use its official reporting
                flow after saving.
              </p>
            </div>
            <div className="step-actions">
              <button
                className="text-button"
                onClick={() => setStep("location")}
              >
                <ArrowLeft size={16} />
                Location
              </button>
              <button className="primary" onClick={save} disabled={saving}>
                {saving ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Check size={18} />
                )}{" "}
                {saving ? "Saving…" : "Save draft"}
              </button>
            </div>
          </div>
        )}
        {tab === "report" && step === "saved" && saved && (
          <div className="saved-content">
            <div className="saved-seal">
              <Check size={42} />
            </div>
            <h2>Saved on this device</h2>
            <p>
              Your draft is saved in this browser.{" "}
              <strong>CenterPoint has not received a report.</strong>
            </p>
            <div className="saved-summary">
              <span>LOCAL DRAFT</span>
              <strong>{saved.poleId ?? "Manually selected location"}</strong>
              <p>
                {saved.issue} · {saved.location.latitude.toFixed(5)},{" "}
                {saved.location.longitude.toFixed(5)}
              </p>
              <small>Reference: {saved.id.slice(0, 8)}</small>
            </div>
            <a
              className="primary full"
              href={OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open CenterPoint reporting
              <ExternalLink size={17} />
            </a>
            <p className="field-help">
              Opens the official website. Nothing is transferred automatically.
              Demo pole IDs must not be used as real utility IDs.
            </p>
            <button
              className="secondary full"
              onClick={() => {
                setTab("reports");
                refresh();
              }}
            >
              View saved drafts
            </button>
            <button className="text-button" onClick={reset}>
              Start another draft
            </button>
          </div>
        )}
        {tab === "reports" && (
          <div className="reports-content">
            <p className="info">
              Saved in this browser. Not sent to CenterPoint.
            </p>
            {drafts.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={44} />
                <h2>No saved drafts</h2>
                <p>Save a draft to find it here later.</p>
                <button className="primary" onClick={reset}>
                  Start a draft
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              drafts.map((d) => (
                <article className="draft-card" key={d.id}>
                  {d.photo && (
                    <img src={d.photo} alt="Saved streetlight photograph" />
                  )}
                  <div>
                    <small>DRAFT · NOT SENT</small>
                    <h2>{d.issue}</h2>
                    <p>
                      {d.poleId ?? "Manual location"} ·{" "}
                      {new Date(d.savedAt).toLocaleDateString()}
                    </p>
                    <button className="text-button" onClick={() => edit(d)}>
                      Review & edit
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Delete draft ${d.id.slice(0, 8)}`}
                    onClick={async () => {
                      try {
                        await deleteDraft(d.id);
                        await refresh();
                      } catch {
                        setError(
                          "Could not delete this draft. Please try again.",
                        );
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))
            )}
          </div>
        )}
        {error && !showMap && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {(
          [
            { key: "map", label: "Map", icon: MapIcon },
            { key: "report", label: "Report", icon: Camera },
            { key: "reports", label: "Saved", icon: ClipboardList },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            aria-current={tab === key ? "page" : undefined}
            className={tab === key ? "active" : ""}
            onClick={() => {
              request.current++;
              setLocationLoading(false);
              setTab(key);
              setError("");
              if (key === "reports") refresh();
              if (key === "map" && !location) changeLocation(HOUSTON, "demo");
            }}
          >
            <span>
              <Icon size={25} />
            </span>
            {label}
            {key === "reports" && drafts.length > 0 && <i>{drafts.length}</i>}
          </button>
        ))}
      </nav>
    </div>
  );
}
