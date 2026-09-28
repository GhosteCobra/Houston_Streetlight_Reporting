import { Tabs } from "expo-router";
import { Text } from "react-native";
import { DraftProvider } from "../lib/draft";
import { colors } from "../components/ui";
export default function Layout() {
  return (
    <DraftProvider>
      <Tabs
        screenOptions={{
          headerTitle: "Streetlight Check",
          headerStyle: { backgroundColor: colors.cream },
          headerTintColor: colors.navy,
          tabBarActiveTintColor: colors.teal,
          tabBarStyle: { height: 76, paddingBottom: 14, paddingTop: 9 },
          sceneStyle: { backgroundColor: colors.cream },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 22 }}>⌂</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 22 }}>◇</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: "Report",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 22 }}>＋</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "My reports",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 22 }}>☷</Text>
            ),
          }}
        />
        <Tabs.Screen name="verify" options={{ href: null, title: "Review" }} />
        <Tabs.Screen
          name="confirmation"
          options={{ href: null, title: "Confirmation" }}
        />
      </Tabs>
    </DraftProvider>
  );
}
