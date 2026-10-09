import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { signInWithGoogleCredential } from "../api/googleService";

export default function RedirectHandler() {
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");

    if (idToken) {
      signInWithGoogleCredential(idToken)
        .then(() => {
          Toast.show({ type: "success", text1: "Google login success" });

          if (window.opener) {
            window.opener.postMessage(
              { type: "GOOGLE_AUTH_SUCCESS", idToken },
              "*"
            );
            window.close();
          } else {
            window.location.replace("/");
          }
        })
        .catch((err) => {
          console.error("Firebase sign-in failed:", err);
          Toast.show({
            type: "error",
            text1: "Login failed",
            text2: err.message,
          });
        });
    } else {
      console.warn("No id_token found in redirect URL.");
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <p className="text-lg font-medium text-gray-700">Completing login...</p>
    </div>
  );
}
