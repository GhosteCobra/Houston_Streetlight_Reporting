import type { rankPoles } from "@/lib/arcgis/poles";

export default function StreetlightSuggestion({
  candidate,
  onConfirm,
  onChooseAnother,
}: {
  candidate: ReturnType<typeof rankPoles>[number];
  onConfirm: () => void;
  onChooseAnother: () => void;
}) {
  return (
    <section className="streetlight-suggestion" aria-label="Suggested streetlight">
      <h2>Is this the streetlight you're reporting?</h2>
      <p>
        We found this sample streetlight near your location. Please check it yourself.
      </p>
      <strong>{candidate.id} · DEMO</strong>
      <p>
        About {Math.round(candidate.distance)} m from your location
        <br />
        {candidate.address}
      </p>
      <p className="field-help">
        {candidate.latitude.toFixed(6)}, {candidate.longitude.toFixed(6)}
        <br />
        {candidate.reason}. GPS proximity does not identify the correct light.
      </p>
      <div className="action-pair">
        <button className="primary" onClick={onConfirm}>
          Confirm Streetlight
        </button>
        <button className="secondary" onClick={onChooseAnother}>
          Choose Another
        </button>
      </div>
    </section>
  );
}
