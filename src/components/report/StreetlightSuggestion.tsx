import { poleLabel, type rankPoles } from "@/lib/arcgis/poles";

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
    <section
      className="streetlight-suggestion"
      aria-label="Suggested streetlight"
    >
      <span className="suggestion-label">Nearby streetlight</span>
      <h2>{poleLabel(candidate)}</h2>
      <p>
        {Math.round(candidate.distance)} m away. Check the pole or map before
        confirming.
      </p>
      <div className="suggestion-actions">
        <button className="primary" onClick={onConfirm}>
          Confirm streetlight
        </button>
        <button className="text-button" onClick={onChooseAnother}>
          Choose another
        </button>
      </div>
    </section>
  );
}
