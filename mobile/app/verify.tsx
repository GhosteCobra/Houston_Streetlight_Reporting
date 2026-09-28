import { useEffect, useRef, useState } from "react";
import { Switch, Text, View } from "react-native";
import { router } from "expo-router";
import {
  issueLabels,
  possibleDuplicates,
  reportInputSchema,
} from "../../shared/report";
import { useDraft, toInput } from "../lib/draft";
import { nativeDemoStore } from "../lib/store";
import { Button, Card, Screen, s } from "../components/ui";
export default function Verify() {
  const { draft, reset } = useDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState(0);
  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);
  const key = useRef("");
  const saving = useRef(false);
  const input = toInput(draft);
  const valid = reportInputSchema.safeParse(input).success;
  useEffect(() => {
    nativeDemoStore
      .list()
      .then((reports) => {
        setDuplicates(possibleDuplicates(toInput(draft), reports).length);
        setReady(true);
      })
      .catch(() =>
        setError(
          "Saved reports could not be read. Return to your draft and try again.",
        ),
      );
  }, [draft]);
  async function save() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      if (!key.current)
        key.current = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const report = await nativeDemoStore.save(input, key.current);
      reset();
      router.replace({
        pathname: "/confirmation",
        params: { id: report.report_id },
      });
    } catch {
      setError(
        "Could not save to this device. Your draft is preserved. Try again.",
      );
    } finally {
      setBusy(false);
      saving.current = false;
    }
  }
  return (
    <Screen title="Review your streetlight">
      {!valid ? (
        <>
          <Text style={s.error}>
            Your report needs details before it can be saved.
          </Text>
          <Button
            label="Complete report"
            onPress={() => router.replace("/report")}
          />
        </>
      ) : (
        <>
          <Card>
            <Text style={s.heading}>{draft.pole_id || "Unknown pole"}</Text>
            <Text style={s.body}>
              {draft.address || "Manual location"}
              {`\n${draft.latitude}, ${draft.longitude}`}
            </Text>
            <Text style={s.heading}>
              {draft.issue_type ? issueLabels[draft.issue_type] : ""}
            </Text>
            <Text style={s.body}>
              {draft.description || "No additional description."}
            </Text>
            <Text style={s.notice}>
              Confirmed by you. No automatic pole match was performed.
            </Text>
          </Card>
          {duplicates > 0 && (
            <Card>
              <Text style={s.heading}>Possible duplicate</Text>
              <Text style={s.body}>
                {duplicates} recent local reports match this issue and location.
              </Text>
              <View style={s.row}>
                <Switch
                  accessibilityLabel="Save another report"
                  value={ack}
                  onValueChange={setAck}
                />
                <Text style={[s.body, { flex: 1 }]}>
                  I want to save another report.
                </Text>
              </View>
            </Card>
          )}
          <Text style={s.notice}>
            Saved on this device only. Nothing is sent to CenterPoint Energy or
            another utility.
          </Text>
          {error && (
            <Text accessibilityRole="alert" style={s.error}>
              {error}
            </Text>
          )}
          <Button
            disabled={busy || !ready || (duplicates > 0 && !ack)}
            label={busy ? "Saving…" : "Save demo report"}
            onPress={save}
          />
          <Button
            label="Edit details"
            secondary
            onPress={() => router.back()}
          />
        </>
      )}
    </Screen>
  );
}
