import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { signInWithGoogleCredential } from "@/src/api/googleService";
import * as authApi from "@/src/api/authService";
import Toast from "react-native-toast-message";
WebBrowser.maybeCompleteAuthSession();

const Authentication = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in environment variables"
    );
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    redirectUri: "http://127.0.0.1:8081/redirect",
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      const handlePopupMessage = (event: any) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.idToken) {
          signInWithGoogleCredential(event.data.idToken)
            .then(() => {
              setIsLoggedIn(true);
              Toast.show({ type: "success", text1: "Google login success" });
            })
            .catch((err: any) => {
              Toast.show({
                type: "error",
                text1: "Login failed",
                text2: err?.message,
              });
            });
        }
      };

      window.addEventListener("message", handlePopupMessage);
      return () => window.removeEventListener("message", handlePopupMessage);
    }

    if (
      (Platform.OS as any) !== "web" &&
      response?.type === "success" &&
      response.authentication?.idToken
    ) {
      const idToken = response.authentication.idToken;
      signInWithGoogleCredential(idToken)
        .then(() => {
          setIsLoggedIn(true);
          Toast.show({ type: "success", text1: "Google login success" });
        })
        .catch((err) =>
          Toast.show({
            type: "error",
            text1: "Login failed",
            text2: err.message,
          })
        );
    }
  }, [response]);

  const showToast = (
    type: "success" | "error" | "info",
    text1: string,
    text2?: string
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "top",
      visibilityTime: 3000,
    });
  };

  return (
    <View className="flex-1 items-center justify-center px-4 bg-background">
      <View className="w-full max-w-md rounded-3xl px-6 py-8 shadow-md bg-backgroundAlt border border-primary">
        {/* Headeren */}
        <View className="mb-6 items-center">
          <Text className="text-3xl font-semibold text-primary">
            {isSignUp ? "Opprett konto" : "Velkommen tilbake"}
          </Text>
          <Text className="text-base mt-2 text-center text-text">
            Logg inn eller registrer deg for å fortsette
          </Text>
        </View>

        {/* Bryter mellom innlogging og registrering */}
        <View className="flex-row items-center justify-between px-4 py-3 mb-6 rounded-2xl bg-background">
          <Text className="text-base font-medium text-primary">Innlogging</Text>

          <Switch
            value={isSignUp}
            onValueChange={setIsSignUp}
            trackColor={{
              false: "#DBD9CD",
              true: "#A5B5B3",
            }}
            thumbColor={isSignUp ? "#ECE3DE" : "#2F2E2C"}
          />

          <Text className="text-base font-medium text-primary">
            Registrering
          </Text>
        </View>

        {/* Innfyllingsfelter */}
        <View>
          {isSignUp && (
            <View className="mb-6">
              <Text className="text-base font-bold mb-2 text-text">
                Brukernavn
              </Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="Brukernavn"
                placeholderTextColor="#A5B5B3"
                className="rounded-xl px-3 py-3 text-base bg-background border border-primary text-text"
              />
            </View>
          )}

          <View className="mb-6">
            <Text className="text-base font-bold mb-2 text-text">E-post</Text>
            <TextInput
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="din.epost@eksempel.no"
              placeholderTextColor="#A5B5B3"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl px-3 py-3 text-base bg-background border border-primary text-text"
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-bold mb-2 text-text">Passord</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#A5B5B3"
              className="rounded-xl px-3 py-3 text-base bg-background border border-primary text-text"
            />
          </View>
        </View>

        {/* Primærknappen */}
        <View className="mt-6">
          <Pressable
            className="py-4 rounded-xl items-center bg-accent"
            onPress={async () => {
              try {
                if (isSignUp) {
                  await authApi.signUp(userEmail, password, userName);
                  showToast("success", "Bruker opprettet!");
                  setIsSignUp(false);
                  setIsLoggedIn(true);
                } else {
                  await authApi.signIn(userEmail, password);
                  showToast("success", "Innlogging vellykket!");
                  setIsLoggedIn(true);
                }
              } catch (error: any) {
                console.error(error);
                showToast(
                  "error",
                  "Feil under autentisering",
                  error?.message ?? "Ukjent feil"
                );
              }
            }}
          >
            <Text className="font-semibold text-lg text-textOnAccent">
              {isSignUp ? "Lag bruker" : "Logg inn"}
            </Text>
          </Pressable>
        </View>

        {/* Separator */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-primary" />
          <Text className="mx-3 text-base uppercase tracking-wide text-primary">
            eller
          </Text>
          <View className="flex-1 h-px bg-primary" />
        </View>

        {/* Google-innlogging */}
        <View>
          <Pressable
            disabled={!request}
            onPress={() => promptAsync()}
            className="flex-row items-center justify-center py-3 rounded-xl border border-primary bg-background"
          >
            <Text className="font-medium text-base text-text">
              Fortsett med Google
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Authentication;
