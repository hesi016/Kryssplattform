// src/api/googleService.ts
import { auth, db } from "@/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createMemberProfile } from "./userService";

// Innlogging med Google og oppretter bruker i Firebase Storage

export const signInWithGoogleCredential = async (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  if (!user) {
    throw new Error("Google sign in failed: no user returned");
  }

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await createMemberProfile(
      user.uid,
      user.displayName ?? "Uten navn",
      user.email ?? ""
    );
    console.log("Created Firestore profile for Google user:", user.uid);
  } else {
    console.log("Firestore profile already exists for:", user.uid);
  }

  return user;
};
