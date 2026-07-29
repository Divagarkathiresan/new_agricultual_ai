import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { AppButton, BrandMark, Card, FieldInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { registerUser, sendOtpToPhone, verifyOtpWithBackend } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number"),
});

const registerSchema = phoneSchema.extend({
  name: z.string().min(2, "Enter your full name"),
});

const otpSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "Enter the 6 digit OTP"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type OtpForm = z.infer<typeof otpSchema>;

function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <ImageBackground source={require("../../assets/images/paddy-login.png")} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.shell}>
          <BrandMark />
          <Card style={styles.authCard}>
            <Text style={styles.title}>Smart Agriculture</Text>
            <Text style={styles.subtitle}>{title}</Text>
            <Text style={styles.caption}>{subtitle}</Text>
            {children}
          </Card>
        </View>
      </View>
    </ImageBackground>
  );
}

export function LoginScreen() {
  const toast = useToast();
  const { control, handleSubmit, formState } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async ({ phone }: PhoneForm) => {
    try {
      await sendOtpToPhone({ phone: `+91${phone}` });
      router.push({ pathname: "/otp" as never, params: { phone: `+91${phone}` } });
    } catch (error: any) {
      toast.show(error.message || "Unable to send OTP.", "error");
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Enter your mobile number to continue">
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FieldInput
            label="Phone Number"
            value={field.value}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={10}
            error={fieldState.error?.message}
            right={<Text style={styles.prefix}>+91</Text>}
          />
        )}
      />
      <AppButton title="Send OTP" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      <AppButton title="Create Account" variant="ghost" onPress={() => router.push("/register" as never)} />
    </AuthShell>
  );
}

export function RegisterScreen() {
  const toast = useToast();
  const { control, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      const phone = `+91${values.phone}`;
      await sendOtpToPhone({ phone });
      toast.show("OTP sent. Verify your phone to create your account.", "success");
      router.push({ pathname: "/otp" as never, params: { phone, name: values.name } });
    } catch (error: any) {
      toast.show(error.message || "Unable to register.", "error");
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Register with OTP authentication">
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FieldInput label="Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FieldInput
            label="Phone Number"
            value={field.value}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={10}
            error={fieldState.error?.message}
            right={<Text style={styles.prefix}>+91</Text>}
          />
        )}
      />
      <AppButton title="Register" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      <AppButton title="Already registered? Login" variant="ghost" onPress={() => router.push("/login" as never)} />
    </AuthShell>
  );
}

export function OtpScreen() {
  const { phone, name } = useLocalSearchParams<{ phone?: string; name?: string }>();
  const toast = useToast();
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);
  const { control, handleSubmit, formState, reset, setValue } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const phoneNumber = Array.isArray(phone) ? phone[0] : phone;
  const displayName = Array.isArray(name) ? name[0] : name;

  const normalizedPhone = (phoneNumber || "").replace(/^\+91/, "");

  const onSubmit = async ({ otp }: OtpForm) => {
    if (!phoneNumber) {
      toast.show("Phone number is missing.", "error");
      return;
    }
    try {
      const login = await verifyOtpWithBackend({ phone: phoneNumber, otp });
      if (!login.accessToken || !login.userId) {
        throw new Error("Login succeeded but no access token was returned.");
      }
      await setAuthenticated({
        phone: phoneNumber,
        userId: login.userId,
        name: displayName,
        accessToken: login.accessToken,
      });
      if (displayName) {
        await registerUser({ uid: login.userId, name: displayName, phone: phoneNumber });
      }
      router.replace("/homepage" as never);
    } catch (error: any) {
      toast.show(error.message || "OTP verification failed.", "error");
    }
  };

  useEffect(() => {
    if (normalizedPhone === "1234567890") {
      setValue("otp", "123456");
      handleSubmit(onSubmit)();
    }
  }, [normalizedPhone, setValue, handleSubmit, onSubmit]);

  return (
    <AuthShell title="Verify OTP" subtitle={`Enter the code sent to ${phoneNumber || "your phone"}`}>
      <Controller
        control={control}
        name="otp"
        render={({ field, fieldState }) => (
          <FieldInput
            label="OTP"
            value={field.value}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={6}
            error={fieldState.error?.message}
          />
        )}
      />
      <AppButton title="Verify OTP" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      <AppButton title="Back" variant="ghost" onPress={() => router.back()} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(16, 48, 18, 0.36)",
  },
  shell: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    gap: 18,
  },
  authCard: {
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  title: {
    color: palette.primary,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  caption: {
    color: palette.muted,
    textAlign: "center",
    fontWeight: "600",
  },
  prefix: {
    color: palette.primary,
    fontWeight: "800",
    paddingRight: 14,
  },
});
