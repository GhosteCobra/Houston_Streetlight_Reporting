"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  RefreshCw,
  LoaderCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import { preparePhoto } from "@/lib/report/photo";
export default function CameraCapture({
  photo,
  onPhoto,
  onContinue,
  onHeading,
}: {
  photo: string | null;
  onPhoto: (value: string | null) => void;
  onContinue: () => void;
  onHeading: (heading: number | null) => void;
}) {
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    input = useRef<HTMLInputElement>(null),
    requestId = useRef(0);
  const [live, setLive] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [facing, setFacing] = useState<"environment" | "user">("environment");
  const heading = useRef<number | null>(null);
  const stop = useCallback(() => {
    requestId.current++;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setLive(false);
    setBusy(false);
  }, []);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [stop]);
  useEffect(() => {
    const read = (event: DeviceOrientationEvent) => {
      const e = event as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
      };
      if (
        typeof e.webkitCompassHeading === "number" &&
        (e.webkitCompassAccuracy ?? 0) >= 0
      )
        heading.current = e.webkitCompassHeading;
      else if (e.absolute && e.alpha !== null)
        heading.current = (360 - e.alpha) % 360;
    };
    window.addEventListener("deviceorientation", read);
    return () => window.removeEventListener("deviceorientation", read);
  }, []);
  async function start(nextFacing = facing) {
    stop();
    setError("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera access needs HTTPS or localhost. You can upload a photo instead.",
      );
      return;
    }
    const id = ++requestId.current;
    setBusy(true);
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacing }, width: { ideal: 1280 } },
        audio: false,
      });
      if (id !== requestId.current) {
        next.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = next;
      setLive(true);
      setBusy(false);
      if (video.current) {
        video.current.srcObject = next;
        await video.current.play();
      }
    } catch (e) {
      if (id !== requestId.current) return;
      stop();
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Camera permission was denied. Upload a photo, or allow camera access in your browser settings."
          : "We could not open the camera. It may be in use. Try again or upload a photo.",
      );
    }
  }
  function capture() {
    const v = video.current;
    if (!v?.videoWidth) {
      setError("The camera is still getting ready. Please try again.");
      return;
    }
    const c = document.createElement("canvas");
    const scale = Math.min(1, 1280 / v.videoWidth);
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    onHeading(facing === "environment" ? heading.current : null);
    onPhoto(c.toDataURL("image/jpeg", 0.82));
    stop();
  }
  async function upload(file?: File) {
    if (!file) return;
    stop();
    setBusy(true);
    setError("");
    try {
      const data = await preparePhoto(file);
      onPhoto(data);
      onHeading(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <div className={"camera-stage " + (photo ? "has-photo" : "")}>
        {!photo && !live && (
          <svg
            className="reference-photo"
            viewBox="42 418 768 820"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <image href="/design-reference.png" width="850" height="1850" />
          </svg>
        )}
        {photo && (
          <img
            className="captured-photo"
            src={photo}
            alt="Your streetlight photograph"
          />
        )}
        <video
          ref={video}
          className={live ? "live-video" : "hidden-video"}
          muted
          playsInline
          aria-label="Live camera preview"
        />
        {!photo && !live && (
          <button
            className="camera-open"
            onClick={() => start()}
            disabled={busy}
          >
            <span className="camera-instruction">
              <Camera size={25} />
              {busy ? "Opening camera…" : "Tap to open camera"}
            </span>
            <span className="example-label">
              Example scene · your camera is off
            </span>
          </button>
        )}
        {live && (
          <div className="viewfinder" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        )}
        <div className="camera-tools">
          <button
            className="glass-button"
            aria-label="Upload a photo"
            onClick={() => input.current?.click()}
            disabled={busy}
          >
            <ImagePlus />
          </button>
          <button
            className="shutter"
            aria-label={
              live ? "Take photo" : photo ? "Retake photo" : "Open camera"
            }
            onClick={() => {
              if (live) capture();
              else {
                if (photo) onPhoto(null);
                start();
              }
            }}
            disabled={busy}
          >
            <span>
              {busy ? (
                <LoaderCircle className="spin" />
              ) : photo ? (
                <RefreshCw />
              ) : null}
            </span>
          </button>
          <button
            className="glass-button"
            aria-label={photo ? "Remove photo" : "Switch camera"}
            onClick={() => {
              if (photo) {
                onPhoto(null);
                stop();
              } else {
                const next = facing === "environment" ? "user" : "environment";
                setFacing(next);
                start(next);
              }
            }}
            disabled={busy}
          >
            <RefreshCw />
          </button>
        </div>
        {live && (
          <button className="stop-camera" onClick={stop}>
            Close camera
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Choose streetlight photo"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <div className="photo-modes">
        <button
          onClick={() => {
            onPhoto(null);
            start();
          }}
        >
          <Camera size={21} />
          Camera
        </button>
        <button onClick={() => input.current?.click()}>
          <ImagePlus size={21} />
          Gallery
        </button>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {photo && (
        <div className="photo-ready">
          <span>
            <Check size={17} />
            Looking good? You can retake it.
          </span>
          <button
            className="primary"
            onClick={() => {
              stop();
              onContinue();
            }}
          >
            Use this photo <ArrowRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}
