import { Platform } from "react-native";
import { auth } from "../firebase/firebaseConfig";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

type PendingConfirmationResult = ConfirmationResult | {
  confirm: (otpCode: string) => Promise<unknown>;
};

let pendingConfirmationResult: PendingConfirmationResult | null = null;

export const sendOtp = async (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error("Invalid phone number");
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    let recaptchaContainer = document.getElementById("recaptcha-container");

    if (!recaptchaContainer) {
      recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      recaptchaContainer.style.display = "none";
      document.body.appendChild(recaptchaContainer);
    }

    const verifier = new RecaptchaVerifier(auth, recaptchaContainer, {
      size: "invisible",
    });

    await verifier.render();
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );
    pendingConfirmationResult = confirmationResult;
    return;
  }

  try {
    // Native Firebase is loaded only on device builds so web bundling stays safe.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const authModule = require("@react-native-firebase/auth");
    const authNative = authModule.default || authModule;
    const confirmation = await authNative().signInWithPhoneNumber(phoneNumber);
    pendingConfirmationResult = confirmation;
  } catch (error: any) {
    console.log("========== FIREBASE ERROR ==========");
    console.log("Code:", error.code);
    console.log("Message:", error.message);
    console.log("Full Error:", JSON.stringify(error, null, 2));
    console.log(error);

    if (
      error?.code === "auth/billing-not" ||
      error?.message?.includes("BILLING_NOT_ENABLED")
    ) {
      throw new Error(
        "Phone authentication requires billing enabled in Firebase. Enable billing for this project or use a Firebase test phone number."
      );
    }

    throw new Error(error.message || "Phone authentication failed on mobile.");
  }
};

export const verifyOtp = async (otpCode: string) => {
  if (!pendingConfirmationResult) {
    throw new Error("OTP session is missing. Please request a new code.");
  }

  return await pendingConfirmationResult.confirm(otpCode);
};
