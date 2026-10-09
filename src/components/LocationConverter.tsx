// src/components/LocationConverter.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  address: string;
  handleLocation: (data: {
    coords: { latitude: number; longitude: number };
  }) => void;
};

export default function LocationConverter({ address, handleLocation }: Props) {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCoords() {
      try {
        const latitude = 59.718609;
        const longitude = 10.840894;

        if (!isMounted) return;

        const nextCoords = { latitude, longitude };
        setCoords(nextCoords);
        handleLocation({ coords: nextCoords });
      } catch (e) {
        console.error("Error converting address:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCoords();
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (isLoading) {
    return (
      <View className="mt-2 flex-row items-center">
        <ActivityIndicator size="small" color="#6B5448" />
        <Text className="ml-2 text-[11px] text-text/70">
          Henter koordinater…
        </Text>
      </View>
    );
  }

  if (!coords) return null;

  return (
    <View className="mt-2 flex-row items-center rounded-2xl bg-background px-3 py-2 border border-accent/40">
      <Ionicons name="location-outline" size={16} color="#6B5448" />
      <Text className="ml-2 text-[11px] text-text/80">
        Lat: {coords.latitude.toFixed(6)} · Lon: {coords.longitude.toFixed(6)}
      </Text>
    </View>
  );
}