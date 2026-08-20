import React from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpen, ChevronRight, CircleHelp, ClipboardList, FileText, LogOut, MapPinned, PenLine, Settings, Sprout } from "lucide-react-native";

import { Illustration } from "@/components/illustrations";
import { AppScreen } from "@/components/screen";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

const menu = [
  { label: "Farm Details", Icon: MapPinned, path: "/farms" },
  { label: "Soil Tests History", Icon: ClipboardList },
  { label: "Advisory History", Icon: Sprout, path: "/predict-crop" },
  { label: "Saved Reports", Icon: FileText },
  { label: "Settings", Icon: Settings },
  { label: "Help & Support", Icon: CircleHelp },
];

export function ProfileScreen() {
  const auth = useAppStore((state) => state.auth);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
  };

  return (
    <AppScreen withNav>
      <View style={styles.header}>
        <Illustration name="farmer" width={96} height={96} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{auth.name || "Smart Farmer"}</Text>
          <Text style={styles.phone}>{auth.phone || "No phone saved"}</Text>
          <Pressable style={styles.editButton}>
            <PenLine size={14} color="#FFFFFF" />
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>

      <Card style={styles.menuCard}>
        {menu.map(({ label, Icon, path }) => (
          <Pressable key={label} style={styles.menuRow} onPress={() => path && router.push(path as never)}>
            <View style={styles.menuIcon}>
              <Icon size={20} color={palette.primary} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            <ChevronRight size={18} color={palette.caption} />
          </Pressable>
        ))}
        <Pressable style={styles.menuRow} onPress={handleLogout}>
          <View style={[styles.menuIcon, styles.logoutIcon]}>
            <LogOut size={20} color={palette.danger} />
          </View>
          <Text style={[styles.menuLabel, styles.logoutText]}>Logout</Text>
          <ChevronRight size={18} color={palette.caption} />
        </Pressable>
      </Card>

      <Card style={styles.reportCard}>
        <BookOpen size={22} color={palette.primary} />
        <Text style={styles.reportTitle}>AI farming records</Text>
        <Text style={styles.reportText}>Your farm plans, advisories, reports, and recommendations stay connected to your secure session.</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: 30,
    backgroundColor: palette.primary,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 7,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  phone: {
    color: "#EAF7E8",
    fontWeight: "800",
  },
  editButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  editText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  menuCard: {
    paddingVertical: 8,
  },
  menuRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: palette.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    backgroundColor: "#FDECEC",
  },
  menuLabel: {
    flex: 1,
    color: palette.text,
    fontWeight: "800",
  },
  logoutText: {
    color: palette.danger,
  },
  reportCard: {
    gap: 8,
    backgroundColor: palette.mint,
  },
  reportTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  reportText: {
    color: palette.muted,
    lineHeight: 20,
    fontWeight: "600",
  },
});
