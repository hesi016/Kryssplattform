import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Text } from "react-native";
import { COLORS } from "@/src/theme/Colors";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.backgroundAlt,
        headerTitleAlign: "center",

        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopWidth: 0,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.backgroundAlt,
        tabBarInactiveTintColor: COLORS.textOnPrimary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dugnader",
          tabBarIcon: ({ color }) => (
            <AntDesign name="tool" size={22} color={color} />
          ),
          headerTitle: () => (
            <Text className="text-lg font-semibold text-backgroundAlt">
              DugnadHub
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={22} color={color} />
          ),
          headerTitle: () => (
            <Text className="text-lg font-semibold text-backgroundAlt">
              Din profil
            </Text>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
