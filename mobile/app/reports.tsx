import { useCallback, useState } from "react";
import { Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { issueLabels, type DemoReport } from "../../shared/report";
import { nativeDemoStore } from "../lib/store";
import { Button, Card, Screen, s } from "../components/ui";
export default function Reports() {
  const [reports, setReports] = useState<DemoReport[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      nativeDemoStore
        .list()
        .then((r) => {
          if (active) {
            setReports(r);
            setError("");
          }
        })
        .catch(() => {
          if (active) setError("Saved reports could not be read.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );
  return (
    <Screen title="My reports">
      <Text style={s.body}>Local demo reports. Not sent to a utility.</Text>
      {error && <Text style={s.error}>{error}</Text>}
      {loading ? (
        <Text style={s.body}>Loading reports…</Text>
      ) : reports.length === 0 ? (
        <Card>
          <Text style={s.heading}>No reports yet</Text>
          <Button
            label="Create a report"
            onPress={() => router.push("/report")}
          />
        </Card>
      ) : (
        reports.map((r) => (
          <Card key={r.report_id}>
            <Text style={s.heading}>{issueLabels[r.issue_type]}</Text>
            <Text style={s.body}>
              {r.address ?? `${r.latitude}, ${r.longitude}`}
            </Text>
            <Text selectable style={s.body}>
              {r.report_id}
            </Text>
            <Text style={s.notice}>Submitted · Local demo</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
