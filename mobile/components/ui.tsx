import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
export const colors = {
  cream: "#fffaf4",
  navy: "#102d51",
  teal: "#319b86",
  muted: "#63748b",
  mint: "#e0f5ee",
  lavender: "#eef0ff",
};
export function Screen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={{ backgroundColor: colors.cream }}
      contentContainerStyle={s.screen}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {children}
    </ScrollView>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && { backgroundColor: colors.lavender },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: colors.navy }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
export const s = StyleSheet.create({
  screen: {
    padding: 24,
    paddingBottom: 50,
    gap: 18,
    maxWidth: 740,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -1,
  },
  heading: { fontSize: 22, fontWeight: "700", color: colors.navy },
  body: { fontSize: 16, lineHeight: 25, color: colors.muted },
  button: {
    backgroundColor: colors.teal,
    padding: 18,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonText: { fontSize: 17, fontWeight: "700", color: "white" },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 22,
    gap: 15,
    borderWidth: 1,
    borderColor: "#e1e6ed",
  },
  label: { fontWeight: "600", fontSize: 14, color: colors.navy, marginTop: 5 },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dce1e9",
    backgroundColor: "white",
    color: colors.navy,
    fontSize: 16,
  },
  notice: {
    padding: 16,
    backgroundColor: colors.mint,
    borderRadius: 15,
    color: colors.navy,
    lineHeight: 22,
    fontSize: 14,
  },
  error: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#ffebe5",
    color: "#942f25",
    lineHeight: 22,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  chip: {
    padding: 13,
    borderWidth: 1,
    borderColor: "#dce1e9",
    borderRadius: 13,
  },
  selected: { backgroundColor: colors.mint, borderColor: colors.teal },
});
