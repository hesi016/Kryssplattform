import { Stack } from "expo-router";
import { AuthSessionProvider } from "../providers/authContext";

import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthSessionProvider>
      <Toast position="top" />
    </SafeAreaProvider>
  );
}
