import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuthSession } from "@/src/providers/authContext";
import { getUserProfile } from "@/src/api/userService";
import { uploadImageToFirebase } from ".././api/ImageService";
import SelectImages from "@/src/components/SelectImages";
import { auth, db } from "@/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

type EditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
};

export default function EditProfileModal({
  visible,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const { user } = useAuthSession();

  // Laster inn brukerdata når modal åpnes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setEmail(profile?.email ?? user.email ?? "");
        setDisplayName(profile?.name ?? user.displayName ?? "");
        const imageFromProfile = (profile as any)?.photoUrl as
          | string
          | undefined;
        setProfileImage(imageFromProfile ?? user.photoURL ?? null);
      } catch (e) {
        console.log("Error loading profile in EditProfileModal", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      setIsLoading(true);
      loadData();
    }
  }, [visible, user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      let finalPhotoUrl = profileImage ?? null;
      if (finalPhotoUrl && !finalPhotoUrl.startsWith("http")) {
        const uploadedUrl = await uploadImageToFirebase(finalPhotoUrl);
        if (uploadedUrl !== "ERROR") {
          finalPhotoUrl = uploadedUrl;
        }
      }

      // 🔥 Oppdaterer firebase auth🔥
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
          photoURL: finalPhotoUrl ?? undefined,
        });
      }

      // 🔥 oppdaterer firebase
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        name: displayName.trim(),
        photoUrl: finalPhotoUrl,
      };

      await updateDoc(userRef, updateData);

      showToast("success", "Profile updated");
      onProfileUpdated && onProfileUpdated();
      onClose();
    } catch (e) {
      console.log("Error updating profile", e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="rounded-t-3xl max-h-[90%] bg-accent shadow-xl">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-base font-semibold text-textOnAccent">
              Redigerer profilen
            </Text>
            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-full items-center justify-center bg-accentMuted/20"
            >
              <Ionicons name="close" size={22} color="#ECE3DE" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#ECE3DE" />
              <Text className="mt-3 text-textOnAccent">Loading profile…</Text>
            </View>
          ) : (
            <View className="rounded-t-3xl bg-background pt-2">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 24,
                }}
              >
                {/* Profilbilde */}
                <View className="items-center mb-6">
                  <View className="w-24 h-24 rounded-full items-center justify-center overflow-hidden mb-3 bg-background border-2 border-primary">
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Ionicons name="person" size={46} color="#6B5448" />
                    )}
                  </View>

                  <Pressable
                    onPress={() => setShowImageModal(true)}
                    className="px-4 py-2 rounded-full border border-primary bg-transparent"
                  >
                    <Text className="text-xs font-semibold text-primary">
                      Bytt profilbide
                    </Text>
                  </Pressable>
                </View>

                {/* Brukernavn */}
                <View className="mb-5">
                  <Text className="text-sm font-bold mb-2 text-primary">
                    Brukernavn
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Ditt navn"
                    placeholderTextColor="#A5B5B3"
                    className="rounded-xl px-3 py-3 text-sm bg-background border border-primary text-text"
                  />
                </View>

                {/* Email */}
                <View className="mb-5">
                  <Text className="text-sm font-bold mb-2 text-primary">
                    Email
                  </Text>
                  <View className="rounded-xl px-3 py-3 bg-backgroundAlt border border-primary">
                    <Text className="text-sm text-text">{email}</Text>
                  </View>
                </View>

                {/* Lagre profil knapp */}
                <Pressable
                  disabled={isSavingProfile}
                  onPress={handleSaveProfile}
                  className={`mt-1 py-3 rounded-xl items-center ${
                    isSavingProfile ? "bg-accentMuted opacity-80" : "bg-accent"
                  }`}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator color="#f9fafb" />
                  ) : (
                    <Text className="font-semibold text-base text-textOnAccent">
                      Lagre
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Bildevelger-modal */}
      <Modal visible={showImageModal} animationType="slide">
        <SelectImages
          closeModal={() => setShowImageModal(false)}
          currentImages={profileImage ? [profileImage] : []}
          setImages={(images) => {
            if (images.length > 0) {
              setProfileImage(images[images.length - 1]);
            }
          }}
        />
      </Modal>
    </Modal>
  );
}
