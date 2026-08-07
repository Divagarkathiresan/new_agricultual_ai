import React from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { palette } from "@/theme/agriculture";

export function AppScreen({
  children,
  scroll = true,
  withNav = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  withNav?: boolean;
}) {
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(980, Math.max(320, width - 32));
  const contentStyle = [styles.content, withNav ? styles.navPadding : undefined, { width: pageWidth, alignSelf: "center" }] as const;

  const content = scroll ? (
    <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, withNav ? styles.navPadding : undefined, { width: pageWidth, alignSelf: "center" }, styles.flex]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.container, width >= 980 && styles.centerContainer]}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      {content}
      {withNav ? <BottomNav /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(102, 187, 106, 0.22)",
  },
  backgroundGlowBottom: {
    position: "absolute",
    left: -110,
    bottom: 70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(223, 242, 240, 0.76)",
  },
  centerContainer: {
    alignItems: "center",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26,
    gap: 18,
  },
  navPadding: {
    paddingBottom: 128,
  },
});
