import React from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/screen";
import { AppButton, BrandMark, Card, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

export function ProfileScreen() {
  const auth = useAppStore((state) => state.auth);
  const farms = useAppStore((state) => state.farms);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
  };

  return (
    <AppScreen withNav>
      <SectionHeader title="Profile" caption="Secure OTP session and farmer details." />
      <Card style={styles.profileCard}>
        <BrandMark />
        <Text style={styles.name}>{auth.name || "Smart Farmer"}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>PH</Text>
          <Text style={styles.info}>{auth.phone || "No phone saved"}</Text>
        </View>
      </Card>
      <Card style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{farms.length}</Text>
          <Text style={styles.statLabel}>Farms</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>AI</Text>
          <Text style={styles.statLabel}>Advisor</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>GPS</Text>
          <Text style={styles.statLabel}>Enabled</Text>
        </View>
      </Card>
      <AppButton title="Logout" variant="secondary" icon={<Text style={styles.logoutIcon}></Text>} onPress={handleLogout} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    gap: 14,
  },
  name: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  info: {
    color: palette.muted,
    fontWeight: "800",
  },
  infoIcon: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  logoutIcon: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  statsCard: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: palette.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: palette.muted,
    fontWeight: "800",
    fontSize: 12,
  },
});
