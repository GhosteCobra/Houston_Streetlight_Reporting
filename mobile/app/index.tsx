/* Metro requires static require for bundled image assets. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, Text } from "react-native";
import { router } from "expo-router";
import { Button, Screen, s } from "../components/ui";
export default function Home() {
  return (
    <Screen title={"Help keep\nour streets lit"}>
      <Text style={s.body}>
        Report streetlights that are out or damaged so our neighborhoods stay
        safe and bright.
      </Text>
      <Button label="Get started" onPress={() => router.push("/report")} />
      <Button
        label="Explore the map"
        secondary
        onPress={() => router.push("/map")}
      />
      <Image
        source={require("../../public/images/neighborhood.png")}
        alt="Illustrated neighborhood with a glowing streetlight"
        style={{ width: "100%", height: 310, borderRadius: 22 }}
        resizeMode="cover"
      />
      <Text style={s.body}>Independent community demo · Houston, TX</Text>
    </Screen>
  );
}
