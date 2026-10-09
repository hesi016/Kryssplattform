import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

import { EventData } from "@/src/types/EventData";
import { useAuthSession } from "../providers/authContext";
import { deletePost } from "../api/postService";

export type EventProps = {
  eventData: EventData;
  refresh: () => Promise<void>;
  onDeleted: (id: string) => void;
  onEdit: (post: EventData) => void;
};

export default function Event({
  eventData,
  refresh,
  onDeleted,
  onEdit,
}: EventProps) {
  const { isEventManager } = useAuthSession();

  const hasImage = eventData.images && eventData.images.length > 0;
  const imageUri = hasImage ? eventData.images![0] : undefined;

  const handleDelete = async () => {
    try {
      await deletePost(eventData.id!);
      onDeleted(eventData.id!);

      Toast.show({
        type: "success",
        text1: "Arrangementet ble slettet",
        text2: `Post '${eventData.title}' ble fjernet.`,
      });

      await refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      Toast.show({
        type: "error",
        text1: "Feil",
        text2: "Innlegget ble ikke slettet",
      });
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/event-details/[id]",
          params: { id: eventData.id },
        })
      }
      className="active:opacity-90"
    >
      <View className="relative bg-backgroundAlt border border-primary/30 rounded-2xl overflow-hidden mb-5 shadow-md shadow-black/20">
        {/* Bilde */}
        <View className="h-48 w-full bg-primary/20">
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full items-center justify-center">
              <EvilIcons name="image" size={48} color="#A5B5B3" />
              <Text className="text-text/60 mt-1 text-xs">Ingen bilde</Text>
            </View>
          )}
        </View>

        {/* Innhold */}
        <View className="px-4 py-4">
          {/* Tittel */}
          <Text className="text-lg font-semibold text-text" numberOfLines={2}>
            {eventData.title}
          </Text>

          {/* Beskrivelse */}
          <Text className="mt-1 text-sm text-text/80" numberOfLines={3}>
            {eventData.description}
          </Text>

          {/* Info-linje */}
          <View className="mt-3 flex-row items-center justify-end">
            {/* Deltakere */}
            <View className="flex-row items-center mr-4">
              <Ionicons name="people-outline" size={18} color="#758987" />
              <Text className="text-text/80 text-sm ml-1">
                {(eventData.participants ?? []).length}/
                {eventData.maxParticipants ?? "?"}
              </Text>
            </View>

            {/* Favoritter */}
            <View className="flex-row items-center mr-4">
              <Ionicons name="heart-outline" size={18} color="#6B5448" />
              <Text className="text-text/80 text-sm ml-1">
                {eventData.favorites?.length ?? 0}
              </Text>
            </View>

            {/* Kommentarer */}
            <View className="flex-row items-center">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#A5B5B3"
              />
              <Text className="text-text/80 text-sm ml-1">
                {eventData.comments?.length ?? 0}
              </Text>
            </View>
          </View>

          {/* Edit + Delete – kun arrangør */}
          {isEventManager && (
            <View className="absolute bottom-3 left-3 flex-row">
              <Pressable
                onPress={() => onEdit(eventData)}
                className="bg-primary rounded-full p-2 mr-2 active:opacity-80"
              >
                <Ionicons name="create-outline" size={18} color="#ECE3DE" />
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="bg-accent rounded-full p-2 active:opacity-80"
              >
                <Ionicons name="trash-outline" size={18} color="#ECE3DE" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
