import { useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  issueLabels,
  reportInputSchema,
  type IssueType,
} from "../../shared/report";
import { useDraft, toInput } from "../lib/draft";
import { Button, Card, Screen, s } from "../components/ui";
export default function Report() {
  const { draft, update } = useDraft();
  const [error, setError] = useState("");
  return (
    <Screen title="New report">
      <Text style={s.notice}>
        Photo-free reporting is available. Native camera integration belongs to
        Person 5; use the web app for a local photo preview.
      </Text>
      <Button
        label="Choose a sample streetlight"
        secondary
        onPress={() => router.push("/map")}
      />
      <Card>
        <Text style={s.heading}>Confirm the location</Text>
        {(["latitude", "longitude", "address"] as const).map((key) => (
          <View key={key}>
            <Text style={s.label}>
              {key === "latitude"
                ? "Latitude"
                : key === "longitude"
                  ? "Longitude"
                  : "Address / landmark (optional)"}
            </Text>
            <TextInput
              accessibilityLabel={key}
              style={s.input}
              value={draft[key]}
              keyboardType={
                key === "address" ? "default" : "numbers-and-punctuation"
              }
              onChangeText={(value) =>
                update({
                  [key]: value,
                  confirmed: false,
                  ...(key !== "address" ? { pole_id: "" } : {}),
                })
              }
            />
          </View>
        ))}
        <Text style={s.body}>Pole: {draft.pole_id || "Unknown"}</Text>
        <View style={s.row}>
          <Switch
            accessibilityLabel="Confirm coordinates"
            value={draft.confirmed}
            onValueChange={(confirmed) => update({ confirmed })}
          />
          <Text style={[s.body, { flex: 1 }]}>
            I confirm these coordinates identify the streetlight.
          </Text>
        </View>
      </Card>
      <Card>
        <Text style={s.heading}>What&apos;s the issue?</Text>
        {Object.entries(issueLabels).map(([key, label]) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: draft.issue_type === key }}
            key={key}
            style={[s.chip, draft.issue_type === key && s.selected]}
            onPress={() => update({ issue_type: key as IssueType })}
          >
            <Text style={s.label}>{label}</Text>
          </Pressable>
        ))}
        {["pole_damaged", "pole_leaning", "exposed_wires"].includes(
          draft.issue_type ?? "",
        ) && (
          <Text style={s.notice}>
            Stay away from damaged equipment. For immediate danger, call
            emergency services.
          </Text>
        )}
        <Text style={s.label}>Description (optional)</Text>
        <TextInput
          accessibilityLabel="Description"
          style={[s.input, { minHeight: 100 }]}
          value={draft.description}
          multiline
          maxLength={2000}
          onChangeText={(description) => update({ description })}
        />
      </Card>
      {error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <Button
        label="Review report"
        onPress={() => {
          const result = reportInputSchema.safeParse(toInput(draft));
          if (!result.success) {
            setError(
              "Choose an issue and confirm valid latitude and longitude.",
            );
            return;
          }
          setError("");
          router.push("/verify");
        }}
      />
    </Screen>
  );
}
