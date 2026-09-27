"use client";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { preparePhoto } from "@/lib/report/photo";

export default function DesktopUpload({
  photo,
  onPhoto,
  onContinue,
}: {
  photo: string | null;
  onPhoto: (photo: string | null) => void;
  onContinue: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function choose(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onPhoto(await preparePhoto(file));
      onContinue();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not read this photo.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <section className="desktop-upload" aria-label="Add a streetlight photo">
      <h2>
        <ImagePlus size={23} /> Add a streetlight photo
      </h2>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload streetlight image"
        onChange={(event) => choose(event.target.files?.[0])}
      />
      {photo ? (
        <div className="desktop-photo-preview">
          <img src={photo} alt="Your selected streetlight" />
          <div className="desktop-photo-actions">
            <button
              className="secondary"
              onClick={() => input.current?.click()}
              disabled={busy}
            >
              Replace photo
            </button>
            <button
              className="text-button"
              onClick={() => onPhoto(null)}
              disabled={busy}
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`desktop-dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            choose(event.dataTransfer.files[0]);
          }}
        >
          <ImagePlus size={45} />
          <strong>Drop a photo here</strong>
          <button
            className="secondary"
            onClick={() => input.current?.click()}
            disabled={busy}
          >
            {busy ? <LoaderCircle className="spin" size={17} /> : null}
            Choose a file
          </button>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="upload-note">
        JPG, PNG or WebP, up to 10 MB. Your photo stays in this browser.
      </p>
    </section>
  );
}
