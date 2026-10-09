import { UserData } from "@/src/types/UserData";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

export async function createUserProfile(userId: string, user: UserData) {
  try {
    await setDoc(doc(db, "users", userId), user);
    console.log("Document written with ID: ", userId);
  } catch (e) {
    console.log("Error crating user profile", e);
  }
}

export async function createMemberProfile(
  userId: string,
  name: string,
  email: string
) {
  const user: UserData = {
    name,
    email,
    role: "Member",
  };

  return createUserProfile(userId, user);
}

export async function getUserProfile(userId: string) {
  try {
    const querySnapshot = await getDoc(doc(db, "users", userId));
    if (!querySnapshot.exists()) {
      console.log("No such document!");
      return null;
    }
    const user = querySnapshot.data() as UserData;
    console.log("Successfully fetched user: ", user);
    return user;
  } catch (e) {
    console.log("Error getting user profile", e);
    return null;
  }
}
