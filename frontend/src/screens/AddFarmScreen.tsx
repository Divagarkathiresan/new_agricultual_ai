import React, { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { AppScreen } from "@/components/screen";
import { AppButton, Card, FieldInput, SectionHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { createFarm } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";
import type { FarmFormValues } from "@/types/domain";

const farmSchema = z.object({
  user_id: z.string().min(1),
  farm_name: z.string().min(2, "Enter farm name"),
  crop_name: z.string().min(1, "Enter or suggest crop name"),
  area: z.object({
    value: z.coerce.number().positive("Area must be greater than 0"),
    unit: z.enum(["acre", "hectare"]),
  }),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  planting_date: z.string().optional(),
  description: z.string().optional(),
});

export function AddFarmScreen() {
  const toast = useToast();
  const auth = useAppStore((state) => state.auth);
  const draft = useAppStore((state) => state.addFarmDraft);
  const prediction = useAppStore((state) => state.predictionResult);
  const updateDraft = useAppStore((state) => state.updateFarmDraft);
  const resetDraft = useAppStore((state) => state.resetFarmDraft);
  const addFarm = useAppStore((state) => state.addFarm);
  const [locationDenied, setLocationDenied] = useState(false);
  const [success, setSuccess] = useState(false);

  const defaults = useMemo(
    () => ({
      ...draft,
      user_id: draft.user_id || auth.userId || auth.phone,
      crop_name: prediction?.recommended_crop || draft.crop_name,
    }),
    [auth.phone, auth.userId, draft, prediction?.recommended_crop],
  );

  const { control, handleSubmit, reset, getValues, formState } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema) as never,
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const requestLocation = useCallback(async () => {
    try {
      const Location = await import("expo-location");
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationDenied(true);
        return;
      }

      setLocationDenied(false);
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const location = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      updateDraft({ location });
      reset({ ...getValues(), location });
    } catch {
      setLocationDenied(true);
    }
  }, [getValues, reset, updateDraft]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      requestLocation().catch(() => setLocationDenied(true));
    }, 0);
    return () => clearTimeout(timeout);
  }, [requestLocation]);

  const mutation = useMutation({
    mutationFn: createFarm,
    onSuccess: (farm) => {
      addFarm(farm);
      setSuccess(true);
      toast.show("Farm saved successfully.", "success");
      resetDraft(auth.userId || auth.phone);
      setTimeout(() => router.replace("/farms" as never), 850);
    },
    onError: (error: Error) => toast.show(error.message || "Unable to save farm.", "error"),
  });

  const suggestCrop = () => {
    updateDraft(getValues());
    router.push("/predict-crop" as never);
  };

  if (locationDenied) {
    return (
      <AppScreen withNav scroll={false}>
        <View style={styles.permission}>
          <Text style={styles.permissionIcon}>GPS</Text>
          <Text style={styles.permissionTitle}>Enable Location to Continue</Text>
          <Text style={styles.permissionText}>Farm coordinates are required and cannot be entered manually.</Text>
          <AppButton title="Retry" onPress={requestLocation} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen withNav>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.form}>
        <SectionHeader title="Add Farm" caption="Create a precise farm profile from your current GPS location." />
        {success ? (
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Farm saved</Text>
          </Card>
        ) : null}

        <Card style={styles.formCard}>
          <Controller control={control} name="farm_name" render={({ field, fieldState }) => (
            <FieldInput label="Farm Name" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )} />

          <Controller control={control} name="crop_name" render={({ field, fieldState }) => (
            <FieldInput
              label="Crop Name"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              right={<AppButton title="Suggest" variant="secondary" icon={<Text style={styles.suggestIcon}>AI</Text>} onPress={suggestCrop} style={styles.suggestButton} />}
            />
          )} />

          <View style={styles.row}>
            <Controller control={control} name="area.value" render={({ field, fieldState }) => (
              <FieldInput
                label="Area"
                value={String(field.value || "")}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                error={fieldState.error?.message}
                style={styles.flexInput}
              />
            )} />
            <Controller control={control} name="area.unit" render={({ field }) => (
              <FieldInput label="Unit" value={field.value} onChangeText={field.onChange} />
            )} />
          </View>

          <Controller control={control} name="soil_type" render={({ field }) => (
            <FieldInput label="Soil Type" value={field.value} onChangeText={field.onChange} />
          )} />
          <Controller control={control} name="irrigation_type" render={({ field }) => (
            <FieldInput label="Irrigation Type" value={field.value} onChangeText={field.onChange} />
          )} />
          <Controller control={control} name="planting_date" render={({ field }) => (
            <FieldInput label="Planting Date" placeholder="YYYY-MM-DD" value={field.value} onChangeText={field.onChange} />
          )} />
          <Controller control={control} name="description" render={({ field }) => (
            <FieldInput label="Description" value={field.value} onChangeText={field.onChange} multiline />
          )} />

          <Controller control={control} name="location" render={({ field }) => (
            <View style={styles.locationBox}>
              <Text style={styles.locationIcon}>GPS</Text>
              <Text style={styles.locationText}>
                {field.value.latitude.toFixed(5)}, {field.value.longitude.toFixed(5)}
              </Text>
            </View>
          )} />

          <AppButton title="Save Farm" loading={mutation.isPending || formState.isSubmitting} onPress={handleSubmit((values) => mutation.mutate(values as FarmFormValues))} />
        </Card>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  formCard: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flexInput: {
    minWidth: 0,
  },
  suggestButton: {
    minHeight: 44,
    borderRadius: 14,
    marginRight: 5,
  },
  locationBox: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: palette.surfaceGreen,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  locationText: {
    color: palette.primary,
    fontWeight: "800",
  },
  permission: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  permissionIcon: {
    color: palette.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  suggestIcon: {
    color: palette.primary,
    fontWeight: "900",
  },
  locationIcon: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  permissionTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  permissionText: {
    color: palette.muted,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
  successCard: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF7E8",
  },
  successIcon: {
    color: palette.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  successText: {
    color: palette.primary,
    fontWeight: "900",
    fontSize: 18,
  },
});
