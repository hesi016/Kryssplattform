// EventCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { EventData } from "@/src/types/EventData";

type Event = EventData;

type EventCardProps = {
  event: Event;
  compact?: boolean;
};

export default function EventPreview({ event }: EventCardProps) {
  return (
    <View className="bg-backgroundAlt rounded-xl px-4 py-3 mb-2 border border-primary/25">
      <Text className="text-text font-medium" numberOfLines={1}>
        {event.title}
      </Text>

      {event.date && (
        <Text className="text-text/70 text-xs mt-1">
          {event.date} {event.time ?? ""}
        </Text>
      )}

      {event.address && (
        <Text className="text-text/60 text-xs mt-1 italic" numberOfLines={1}>
          {event.address}
        </Text>
      )}
    </View>
  );
}
