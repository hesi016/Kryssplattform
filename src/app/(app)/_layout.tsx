import { useAuthSession } from "../../providers/authContext";
import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function ProtectedLayout() {
  const { isLoading, user } = useAuthSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <View className="px-6 py-4 rounded-2xl bg-backgroundAlt border border-primary shadow-md">
          <Text className="text-primary text-lg font-semibold">
            Henter bruker...
          </Text>
          <Text className="text-text text-base mt-1">
            Vennligst vent et øyeblikk
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    // enkel redirect hvis ikke logget inn
    return <Redirect href="/authentication" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: "Tilbake",
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen name="event-details/[id]" />
    </Stack>
  );
}
