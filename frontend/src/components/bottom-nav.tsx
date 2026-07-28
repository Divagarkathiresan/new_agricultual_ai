import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";

import { palette, radius, shadow } from "@/theme/agriculture";

const tabs = [
  { label: "Home", path: "/homepage", icon: "H" },
  { label: "Farms", path: "/farms", icon: "F" },
  { label: "Recommendation", path: "/predict-crop", icon: "R" },
  { label: "Profile", path: "/profile", icon: "P" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <View style={styles.nav}>
        {tabs.map(({ label, path, icon }) => {
          const active = pathname === path || (path === "/farms" && pathname === "/add-farm");
          return (
            <Pressable key={path} style={styles.item} onPress={() => router.replace(path as never)}>
              <View style={[styles.iconBadge, active && styles.activeIconBadge]}>
                <Text style={[styles.iconText, active && styles.activeIconText]}>{icon}</Text>
              </View>
              <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.fab} onPress={() => router.push("/add-farm" as never)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    minHeight: 72,
    borderRadius: radius.xl,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    ...shadow,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    color: palette.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: "#F0F4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBadge: {
    backgroundColor: palette.surfaceGreen,
  },
  iconText: {
    color: palette.caption,
    fontWeight: "900",
    fontSize: 13,
  },
  activeIconText: {
    color: palette.primary,
  },
  activeLabel: {
    color: palette.primary,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 96,
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
  },
});
