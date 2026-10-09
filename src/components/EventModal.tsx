import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventData } from "@/src/types/EventData";
import EventPreview from "./EventPreview";

type Event = EventData;

type EventModalProps = {
  title: string;
  visible: boolean;
  onClose: () => void;
  events: Event[];
};

export default function EventModal({
  title,
  visible,
  onClose,
  events,
}: EventModalProps) {
  const isEmpty = !events || events.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full rounded-3xl bg-backgroundAlt border border-primary px-5 py-6 shadow-xl max-h-[75%] relative">
          {/* Lukke-knapp */}
          <Pressable
            onPress={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#ECE3DE" />
          </Pressable>

          {/* Tittel */}
          <Text className="text-lg font-semibold text-text mb-4 pr-8">
            {title}
          </Text>

          {/* Innhold */}
          <View className="rounded-2xl bg-background border border-primary/40">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
            >
              {isEmpty ? (
                <Text className="text-sm text-text">
                  Ingen arrangementer her ennå.
                </Text>
              ) : (
                events.map((event) => (
                  <EventPreview key={event.id} event={event} />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
