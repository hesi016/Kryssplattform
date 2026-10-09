import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "firebaseConfig";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import * as authApi from "../api/authService";
import { createMemberProfile, getUserProfile } from "../api/userService";
import { UserData } from "../types/UserData";

type AuthContextType = {
  signIn: (email: string, password: string) => void;
  signOut: VoidFunction;
  createUser: (email: string, password: string, displayName: string) => void;
  userNameSession?: string | null;
  isLoading: boolean;
  user: User | null;
  profile: UserData | null;
  isEventManager: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider");
  }
  return ctx;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [userSession, setUserSession] = useState<string | null>(null);
  const [userAuth, setUserAuth] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserData | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);

      (async () => {
        if (user) {
          setUserSession(user.displayName);
          setUserAuth(user);

          let fetchedProfile = await getUserProfile(user.uid);

          // Hvis brukeren mangler profil i Firestore, opprettes en standard Member-profil
          if (!fetchedProfile) {
            await createMemberProfile(
              user.uid,
              user.displayName ?? "Uten navn",
              user.email ?? ""
            );
            fetchedProfile = await getUserProfile(user.uid);
          }

          setProfile(fetchedProfile ?? null);
        } else {
          setUserSession(null);
          setUserAuth(null);
          setProfile(null);
        }

        router.replace("/");
        setIsLoading(false);
      })();
    });

    return () => unsub();
  }, [router]);

  const isEventManager = profile?.role === "EventManager";

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          await authApi.signIn(email, password);
        },
        signOut: async () => {
          await authApi.signOut();
        },
        createUser: async (
          email: string,
          password: string,
          displayName: string
        ) => {
          const newUser = await authApi.signUp(email, password, displayName);
          if (newUser) {
            setUserSession(displayName);
          }
        },
        userNameSession: userSession,
        isLoading,
        user: userAuth,
        profile,
        isEventManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
