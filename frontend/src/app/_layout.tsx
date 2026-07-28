import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ToastProvider } from "@/components/toast";

SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync().catch(() => undefined);

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider
          value={{
            dark: false,
            colors: {
              primary: "#2E7D32",
              background: "#F7FAF5",
              card: "#FFFFFF",
              text: "#1F321D",
              border: "#DCE9D5",
              notification: "#66BB6A",
            },
            fonts: {
              regular: { fontFamily: "System", fontWeight: "400" },
              medium: { fontFamily: "System", fontWeight: "500" },
              bold: { fontFamily: "System", fontWeight: "700" },
              heavy: { fontFamily: "System", fontWeight: "900" },
            },
          }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
