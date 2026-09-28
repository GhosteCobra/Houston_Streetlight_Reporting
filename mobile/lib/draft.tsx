import { createContext, useContext, useState, type ReactNode } from "react";
import type { IssueType, ReportInput } from "../../shared/report";
export type NativeDraft = {
  pole_id: string;
  latitude: string;
  longitude: string;
  address: string;
  issue_type: IssueType | null;
  description: string;
  confirmed: boolean;
};
const empty: NativeDraft = {
  pole_id: "",
  latitude: "",
  longitude: "",
  address: "",
  issue_type: null,
  description: "",
  confirmed: false,
};
const Context = createContext<{
  draft: NativeDraft;
  update: (values: Partial<NativeDraft>) => void;
  reset: () => void;
} | null>(null);
export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(empty);
  return (
    <Context.Provider
      value={{
        draft,
        update: (values) => setDraft((d) => ({ ...d, ...values })),
        reset: () => setDraft(empty),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDraft() {
  const context = useContext(Context);
  if (!context) throw new Error("DraftProvider is required");
  return context;
}
export function toInput(d: NativeDraft): ReportInput {
  return {
    pole_id: d.pole_id || null,
    latitude: d.latitude.trim() ? Number(d.latitude) : NaN,
    longitude: d.longitude.trim() ? Number(d.longitude) : NaN,
    address: d.address || null,
    issue_type: d.issue_type as IssueType,
    description: d.description,
    location_confirmed: d.confirmed as true,
    location_source: "manual",
    location_accuracy_m: null,
    captured_at: null,
    photo_path: null,
  };
}
