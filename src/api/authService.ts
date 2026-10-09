import { auth } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { createMemberProfile } from "./userService";

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error("Something went wrong: ", error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    console.log("Signed out successfully");
  } catch (error: any) {
    console.error(
      "An unexpected problem occurred while signing out. ",
      error.message
    );
    throw error;
  }
};

// oppretter bruker og lagrer i firebase auth & storage
export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (user) {
      await updateProfile(user, {
        displayName: username,
      });

      await createMemberProfile(user.uid, username, user.email ?? email);
    }

    return user;
  } catch (error: any) {
    console.error(`Signup error: ${error.code}, message: ${error.message}`);
    throw error;
  }
};
