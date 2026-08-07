import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { Home, MapPinned, Sprout, UserRound } from "lucide-react-native";

import { palette, radius, shadow } from "@/theme/agriculture";

const tabs = [
  { label: "Home", path: "/homepage", Icon: Home },
  { label: "Farms", path: "/farms", Icon: MapPinned },
  { label: "Recommendation", path: "/predict-crop", Icon: Sprout },
  { label: "Profile", path: "/profile", Icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      {tabs.map(({ label, path, Icon }) => {
        const active = pathname === path || (path === "/farms" && pathname === "/add-farm");
        const iconColor = active ? palette.primary : palette.caption;
        return (
          <Pressable key={path} style={styles.item} onPress={() => router.replace(path as never)}>
            <View style={[styles.iconBadge, active && styles.activeIconBadge]}>
              <Icon size={18} color={iconColor} strokeWidth={2.4} />
            </View>
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.78)",
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
    backgroundColor: "rgba(240, 244, 236, 0.58)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBadge: {
    backgroundColor: "rgba(234, 246, 231, 0.84)",
  },
  activeLabel: {
    color: palette.primary,
  },
});
