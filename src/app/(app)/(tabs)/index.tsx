import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
} from "react-native";
import PostFormModal from "@/src/components/EventFormModal";
import Toast from "react-native-toast-message";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Stack } from "expo-router";
import Event from "@/src/components/Event";
import React from "react";
import * as postApi from "@/src/api/postService";
import { useAuthSession } from "@/src/providers/authContext";
import { EventData } from "@/src/types/EventData";
import { AntDesign } from "@expo/vector-icons";
import CategoryPicker from "@/src/components/CategoryPicker";

export default function Index() {
  const [posts, setPosts] = useState<EventData[]>([]);
  const [allPosts, setAllPosts] = useState<EventData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, userNameSession, isEventManager } = useAuthSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [editingPost, setEditingPost] = useState<EventData | null>(null);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setAllPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const getPostsFromBackend = async (category = "") => {
    const postsFromApi = await postApi.getRemoteFilteredPosts(category);
    const sorted = [...postsFromApi].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
    setAllPosts(sorted);
    setPosts(sorted);
  };

  useEffect(() => {
    const fetchFiltered = async () => {
      await getPostsFromBackend(selectedCategory);
    };
    fetchFiltered();
  }, [selectedCategory]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPosts(allPosts);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const locallyFiltered = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
    setPosts(locallyFiltered);
  }, [searchQuery, allPosts]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await getPostsFromBackend();
      };
      fetchData();
    }, [])
  );

  const showToast = (
    type: "success" | "error",
    text1: string,
    text2?: string
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
    });
  };

  const handleEditPost = (post: EventData) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#6B5448" },
          headerTintColor: "#ECE3DE",
          headerTitle: "DugnadHub",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerRight: () =>
            isEventManager ? (
              <Pressable
                className="pr-4"
                accessibilityRole="button"
                accessibilityLabel="Opprett ny dugnad"
                onPress={() => {
                  setEditingPost(null);
                  setIsModalOpen(true);
                }}
              >
                <AntDesign name="plus" size={22} color="#ECE3DE" />
              </Pressable>
            ) : null,
        }}
      />

      {/* Modal for Eventform */}
      <Modal visible={isModalOpen} animationType="slide">
        <PostFormModal
          addNewEvent={async (event) => {
            try {
              await postApi.createPost(event);
              await getPostsFromBackend(selectedCategory);
              handleCloseModal();
              showToast("success", "Innlegg lagt til!");
            } catch (error) {
              console.error("Error saving posts:", error);
              showToast("error", "Kunne ikke lagre innlegget", String(error));
            }
          }}
          closeModal={handleCloseModal}
          editingEvent={editingPost}
          onUpdateEvent={async (updatedPost) => {
            try {
              await postApi.updatePost(updatedPost.id!, updatedPost);
              await getPostsFromBackend(selectedCategory);
              handleCloseModal();
              showToast("success", "Innlegg oppdatert!");
            } catch (error) {
              console.error("Error updating post:", error);
              showToast(
                "error",
                "Kunne ikke oppdatere innlegget",
                String(error)
              );
            }
          }}
        />
      </Modal>

      {/* velkomst + søk/filter */}
      <View className="w-full px-5 pt-4 pb-2">
        {user && showWelcome && (
          <View className="mb-4">
            <View className="bg-backgroundAlt border border-primary/30 rounded-2xl px-5 py-4 shadow-md relative">
              {/* Lukkeknapp oppe til høyre */}
              <Pressable
                onPress={() => setShowWelcome(false)}
                className="absolute top-2 right-2 p-1"
                accessibilityRole="button"
                accessibilityLabel="Skjul velkomstmelding"
              >
                <AntDesign name="close" size={18} color="#758987" />
              </Pressable>

              <View className="items-center">
                <Text className="text-text/70 text-xs font-medium tracking-[0.2em] uppercase mb-1 text-center">
                  Velkommen tilbake {userNameSession}
                </Text>

                <Text className="text-text/80 text-sm mt-2 text-center max-w-[260px]">
                  Klar for å bidra til fellesskapet igjen?
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="bg-backgroundAlt border border-primary/30 rounded-2xl p-5 shadow-md">
          <Text className="text-text font-semibold text-lg">
            Søk etter dugnader
          </Text>

          {/* Søkefelt */}
          <View className="mt-4">
            <TextInput
              placeholder="F.eks. loppemarked, vaffelsalg..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A5B5B3"
              className="bg-background border border-primary/30 text-text rounded-xl px-3 py-3 text-base"
              accessibilityLabel="Søk i dugnader etter tittel, beskrivelse eller sted"
              returnKeyType="search"
            />
          </View>

          {/* Kategori-filter */}
          <View className="mt-6">
            <CategoryPicker
              value={selectedCategory}
              onChange={setSelectedCategory}
              showAllOptions={true}
            />
          </View>
        </View>
      </View>

      {/* Liste over arrangementer */}
      <FlatList
        className="flex-1 w-full px-5"
        data={posts}
        ListHeaderComponent={() => <View className="h-3" />}
        ListFooterComponent={() => <View className="h-16" />}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={(event) => (
          <Event
            eventData={event.item}
            refresh={getPostsFromBackend}
            onDeleted={handlePostDeleted}
            onEdit={handleEditPost}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
