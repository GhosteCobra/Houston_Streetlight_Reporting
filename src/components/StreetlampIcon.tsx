import type { SVGProps } from "react";
export function StreetlampIcon({
  size = 24,
  strokeWidth = 1.8,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M11 37V12a8 8 0 0 1 16 0M6 37h10M22 12h9M23 12l1 6h5l1-6M18 5l-3-2M5 15H1M5 21l-3 2" />
      <path d="M24 22v3M30 21l2 2" stroke="#edc562" />
    </svg>
  );
}
