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
