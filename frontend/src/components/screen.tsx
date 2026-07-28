import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, withNav && styles.navPadding]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, withNav && styles.navPadding]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
