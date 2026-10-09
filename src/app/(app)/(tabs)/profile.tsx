import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthSession } from "@/src/providers/authContext";

import EventModal from "@/src/components/EventModal";
import EditProfileModal from "@/src/components/EditProfileModal";
import { useProfileData } from "@/src/types/UseProfileData";

export default function ProfilePage() {
  const { user, userNameSession, signOut } = useAuthSession();
  const router = useRouter();

  const {
    isLoading,
    userProfile,
    pastEvents,
    upcomingEvents,
    favoriteEvents,
    joinedEvents,
    reload,
  } = useProfileData(user);

  const [showPastModal, setShowPastModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [showJoinedPastModal, setShowJoinedPastModal] = useState(false);
  const [showJoinedUpcomingModal, setShowJoinedUpcomingModal] = useState(false);
  const [showJoinedOngoingModal, setShowJoinedOngoingModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6B5448" />
        <Text className="mt-4 text-sm text-primary">Laster profilen din…</Text>
      </View>
    );
  }

  const displayName =
    userProfile?.name ?? userNameSession ?? user?.email ?? "Bruker";

  const profileImage = (userProfile as any)?.photoUrl ?? user?.photoURL ?? null;

  return (
    <View className="flex-1 px-4 pt-10 pb-6 bg-background">
      {/* Hovedkort */}
      <View className="flex-1 rounded-3xl overflow-hidden shadow-md bg-backgroundAlt border border-primary">
        {/* Topp rad */}
        <View className="flex-row items-center justify-between px-4 pt-4">
          {/* Settings */}
          <Pressable
            onPress={() => setShowEditProfile(true)}
            className="w-9 h-9 rounded-full items-center justify-center bg-primary"
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color="#ECE3DE" 
            />
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace("/authentication");
            }}
          >
            <Text className="font-semibold text-xs text-primary">Logg ut</Text>
          </Pressable>
        </View>

        {/* Scroll area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        >
          {/* Profilbilde + navn */}
          <View className="items-center mt-4">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-2 overflow-hidden bg-background">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                />
              ) : (
                <Ionicons name="person" size={38} color="#6B5448" />
              )}
            </View>

            <Text className="text-xl font-semibold text-text">
              {displayName}
            </Text>
          </View>

          {/* Pågående arrangementer (åpner modal) */}
          <View className="mt-6">
            <Text className="text-sm font-semibold mb-2 text-primary">
              Pågående arrangementer
            </Text>

            {joinedEvents.ongoing.length === 0 ? (
              <Text className="text-sm text-text">
                Du har ingen arrangementer i dag.
              </Text>
            ) : (
              <Pressable
                onPress={() => setShowJoinedOngoingModal(true)}
                className="rounded-2xl px-5 py-4 bg-accentMuted"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-textOnPrimary">
                    {joinedEvents.ongoing.length} pågående
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#ECE3DE" />
                </View>
              </Pressable>
            )}
          </View>

          {/* Kommende arrangementer */}
          <View className="mt-6">
            <Text className="text-sm font-semibold mb-2 text-primary">
              Kommende arrangementer
            </Text>

            <Pressable
              onPress={() => setShowJoinedUpcomingModal(true)}
              className="rounded-2xl px-5 py-4 bg-accentMuted"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-textOnPrimary">
                  {joinedEvents.upcoming.length} kommende
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ECE3DE" />
              </View>
            </Pressable>
          </View>

          {/* Tidligere arrangementer */}
          <View className="mt-6">
            <Text className="text-sm font-semibold mb-2 text-primary">
              Tidligere arrangementer
            </Text>

            <Pressable
              onPress={() => setShowJoinedPastModal(true)}
              className="rounded-2xl px-5 py-4 bg-accentMuted"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-textOnPrimary">
                  {joinedEvents.past.length} fullført
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ECE3DE" />
              </View>
            </Pressable>
          </View>

          {/* Favoritter */}
          <View className="mt-7 mb-4">
            <Text className="text-sm font-semibold mb-2 text-primary">
              Favoritter
            </Text>

            {favoriteEvents.length === 0 ? (
              <Text className="text-sm text-text">
                Du har ingen favoritter enda.
              </Text>
            ) : (
              favoriteEvents.map((event) => (
                <View
                  key={event.id}
                  className="rounded-xl px-4 py-3 mb-2 bg-background border border-primary"
                >
                  <Text className="font-medium text-text">{event.title}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modals for arrangementer har deltatt på */}
      <EventModal
        title="Tidligere arrangementer"
        visible={showPastModal}
        onClose={() => setShowPastModal(false)}
        events={pastEvents}
      />

      <EventModal
        title="Kommende arrangementer"
        visible={showUpcomingModal}
        onClose={() => setShowUpcomingModal(false)}
        events={upcomingEvents}
      />

      {/* Modals for arrangementer du har meldt deg på */}
      <EventModal
        title="Pågående arrangementer du deltar på"
        visible={showJoinedOngoingModal}
        onClose={() => setShowJoinedOngoingModal(false)}
        events={joinedEvents.ongoing}
      />

      <EventModal
        title="Tidligere arrangementer du har deltatt på"
        visible={showJoinedPastModal}
        onClose={() => setShowJoinedPastModal(false)}
        events={joinedEvents.past}
      />

      <EventModal
        title="Kommende arrangementer du er påmeldt"
        visible={showJoinedUpcomingModal}
        onClose={() => setShowJoinedUpcomingModal(false)}
        events={joinedEvents.upcoming}
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={reload}
      />
    </View>
  );
}
