import React from "react";
import { ScrollView, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";
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
  const pageWidth = Math.min(760, Math.max(320, width - 24));
  const contentStyle: StyleProp<ViewStyle> = [styles.content, withNav ? styles.navPadding : undefined, { width: pageWidth, alignSelf: "center" }];

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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
    gap: 18,
  },
  navPadding: {
    paddingBottom: 128,
  },
});
