import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { verifyOtpWithBackend } from "./services/api";

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const phoneNumber = Array.isArray(phone) ? phone[0] : phone;
    const trimmedOtp = otp.trim();

    if (!phoneNumber) {
      alert("Phone number is missing. Please go back and request OTP again.");
      return;
    }

    if (trimmedOtp.length !== 6) {
      alert("Invalid OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpWithBackend({
        phone: phoneNumber,
        otp: trimmedOtp,
      });

      if (result.success) {
        router.replace("/homepage" as any);
        return;
      }

      alert(result.message || "OTP verification failed.");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🔐</Text>

        <Text style={styles.title}>Verify OTP</Text>

        <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
        />

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
          <Text style={styles.linkText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9F3",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 70,
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E7D32",
  },

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "#666",
  },

  notice: {
    fontSize: 14,
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
    lineHeight: 20,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },

  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },

  linkText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
});
