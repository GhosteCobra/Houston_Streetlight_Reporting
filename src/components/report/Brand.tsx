import { MapPin } from "lucide-react";
export default function Brand() {
  return (
    <header className="brand-header">
      <div className="brand">
        <svg className="lamp-logo" viewBox="0 0 48 66" aria-hidden="true">
          <path
            d="M8 60V21Q8 6 23 6h7q7 0 7 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M24 18q0-9 10-9t10 9" fill="#4a657b" />
          <path
            d="M24 19h20"
            stroke="#4a657b"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M34 27v5m-10-8-3 4m22-4 3 4"
            stroke="#edb841"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M3 62h16"
            stroke="#4a657b"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <p className="brand-name">Streetlight Check</p>
          <p className="brand-location">
            <MapPin size={16} fill="currentColor" />
            Houston, TX
          </p>
        </div>
      </div>
      <svg className="skyline" viewBox="0 0 370 140" aria-hidden="true">
        <ellipse cx="225" cy="31" rx="190" ry="100" fill="#d9eaff" />
        <path
          d="M55 55q-4-16 12-15 7-22 25-7 19-7 23 8 20-1 19 14"
          fill="#fffaf1"
        />
        <path d="M255 28q7-20 23-8 17-22 34-7 18-1 20 15" fill="#fffaf1" />
        <g fill="#8bbfe6">
          <path d="M86 132V77h17v55m9 0V53h18v79m8 0V84h24v48m47 0V17q8-4 21 0v115m67 0V81h16v51m10 0V62h20v70" />
        </g>
        <g fill="#b2abe4">
          <path d="M163 132V69l11-28h13l10 28v63m73 0V50l10-29h15l9 29v82" />
        </g>
        <path d="M238 132V57h18v75" fill="#cdbfbd" />
        <path d="M65 118h282" stroke="#fff6e6" strokeWidth="5" />
        <g fill="#83b79f">
          <circle cx="73" cy="120" r="25" />
          <circle cx="49" cy="136" r="21" />
          <circle cx="325" cy="117" r="27" />
          <circle cx="355" cy="135" r="28" />
        </g>
      </svg>
    </header>
  );
}
