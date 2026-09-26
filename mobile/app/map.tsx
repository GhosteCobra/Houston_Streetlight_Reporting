import { useState } from "react";
import { Text, TextInput } from "react-native";
import { router } from "expo-router";
import { demoPoles } from "../../shared/report";
import { useDraft } from "../lib/draft";
import { Button, Card, Screen, s } from "../components/ui";
export default function Map() {
  const [query, setQuery] = useState("");
  const { update } = useDraft();
  const poles = demoPoles.filter((p) =>
    `${p.pole_id} ${p.address}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Screen title="Streetlight map">
      <Text style={s.notice}>
        Sample pole list. The map teammate can connect the native map here.
        These are synthetic locations.
      </Text>
      <TextInput
        accessibilityLabel="Search streetlights"
        style={s.input}
        placeholder="Search address or pole ID"
        value={query}
        onChangeText={setQuery}
      />
      {poles.map((p) => (
        <Card key={p.pole_id}>
          <Text style={s.heading}>{p.pole_id}</Text>
          <Text style={s.body}>{p.address}</Text>
          <Text style={s.body}>Status: {p.status}</Text>
          <Button
            label="Report this streetlight"
            onPress={() => {
              update({
                pole_id: p.pole_id,
                latitude: String(p.latitude),
                longitude: String(p.longitude),
                address: p.address ?? "",
                confirmed: false,
              });
              router.push("/report");
            }}
          />
        </Card>
      ))}
      {poles.length === 0 && (
        <Text style={s.body}>No matching streetlights.</Text>
      )}
    </Screen>
  );
}
