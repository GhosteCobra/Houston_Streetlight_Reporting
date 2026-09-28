import { useEffect, useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { nativeDemoStore } from "../lib/store";
import { Button, Card, Screen, s } from "../components/ui";
export default function Confirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [found, setFound] = useState<boolean | null>(null);
  useEffect(() => {
    nativeDemoStore
      .list()
      .then((r) => setFound(r.some((item) => item.report_id === id)))
      .catch(() => setFound(false));
  }, [id]);
  return (
    <Screen title={found ? "Report saved" : "Report confirmation"}>
      <Card>
        {found === null ? (
          <Text style={s.body}>Checking local save…</Text>
        ) : found ? (
          <>
            <Text style={s.heading}>
              Thank you for looking out for your neighborhood.
            </Text>
            <Text selectable style={s.body}>
              Internal report number: {id}
            </Text>
            <Text style={s.notice}>
              Local demo only. Not sent to a utility.
            </Text>
          </>
        ) : (
          <Text style={s.error}>No saved report was found on this device.</Text>
        )}
      </Card>
      <Button
        label="View my reports"
        onPress={() => router.replace("/reports")}
      />
      <Button
        label="Back to home"
        secondary
        onPress={() => router.replace("/")}
      />
    </Screen>
  );
}
