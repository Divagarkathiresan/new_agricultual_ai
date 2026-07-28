import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendOtpToPhone } from "./services/api";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.length !== 10) {
      alert("Invalid phone number");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const result = await sendOtpToPhone({ phone: fullPhone });

      if (result.success) {
        router.push({ pathname: "/otp" as any, params: { phone: fullPhone } });
        return;
      }

      alert(result.message || "Unable to send OTP. Please try again.");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/paddy-login.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.brandBadge}>
              <Text style={styles.logo}>🌱</Text>
            </View>

            <View style={styles.formPanel}>
              <Text style={styles.title}>Smart Agriculture</Text>

              <Text style={styles.subtitle}>Welcome Back</Text>

              <Text style={styles.description}>
                Enter your mobile number to continue
              </Text>

              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryText}>+91</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="#7A7F73"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(value) => setPhone(value.replace(/\D/g, ""))}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.linkText}>New user? Register here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#24451F",
  },

  backgroundImage: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(12, 35, 16, 0.34)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 28,
  },

  brandBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },

  formPanel: {
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: "rgba(250, 255, 246, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.72)",
  },

  logo: {
    fontSize: 42,
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    textAlign: "center",
    color: "#1F6B2A",
  },

  subtitle: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
    color: "#263322",
  },

  description: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginBottom: 28,
    fontSize: 15,
  },

  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  countryCode: {
    width: 70,
    height: 55,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.68)",
    marginRight: 10,
  },

  countryText: {
    fontSize: 18,
    fontWeight: "600",
  },

  input: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.68)",
    paddingHorizontal: 15,
    fontSize: 18,
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
