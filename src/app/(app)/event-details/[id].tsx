import { getUserProfile } from "@/src/api/userService";
import * as commentApi from "../../../api/commentService";
import * as postApi from "../../../api/postService";
import { useAuthSession } from "../../../providers/authContext";
import { EventData } from "../../../types/EventData";
import CommentsSection from "@/src/components/CommentsSection";

import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Modal,
} from "react-native";
import { UserComment } from "@/src/types/CommentData";
import LocationConverter from "@/src/components/LocationConverter";

export default function EventDetailsPage() {
  /* Henter id fra URL */
  const { id } = useLocalSearchParams<{ id: string }>();

  /* Auth-info for innlogget bruker */
  const { userNameSession, user, isEventManager } = useAuthSession();

  /* Dugnad (post) */
  const [post, setPost] = useState<EventData | null>(null);

  /* Kommentar-relatert state */
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<UserComment[]>([]);
  const [likes, setLikes] = useState<string[]>([]);

  /* Loading-state */
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);

  /* Deltakerlister */
  const [participantProfiles, setParticipantProfiles] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
    useState(false);

  /* Henter dugnaden + kommentarer + deltakere */
  async function fetchPostFromApi(inputId: string) {
    try {
      const backendPost = await postApi.getPostById(inputId);

      if (backendPost) {
        setPost(backendPost);
        setLikes(backendPost.favorites ?? []);

        /* Henter kommentarer */
        setIsLoadingComments(true);
        const fetchedComments = await commentApi.getCommentsByIds(
          backendPost.comments ?? []
        );
        setComments(fetchedComments || []);
        setIsLoadingComments(false);

        /* Henter brukernavn til deltakere */
        await loadParticipantProfiles(backendPost.participants ?? []);
      } else {
        console.warn("Fant ikke post i Firestore for id:", inputId);
        setPost(null);
      }
    } finally {
      setIsLoadingPost(false);
    }
  }

  /* Henter profilnavn til deltakere */
  async function loadParticipantProfiles(participantIds: string[]) {
    setIsLoadingParticipants(true);

    try {
      if (!participantIds || participantIds.length === 0) {
        setParticipantProfiles([]);
        return;
      }

      const profiles = await Promise.all(
        participantIds.map(async (uid) => {
          const profile = await getUserProfile(uid);
          return { id: uid, name: profile?.name || uid };
        })
      );

      setParticipantProfiles(profiles);
    } catch (error) {
      console.error("Error loading participant profiles:", error);
    } finally {
      setIsLoadingParticipants(false);
    }
  }

  /* Kjør når id endrer seg */
  useEffect(() => {
    if (!id) return;
    fetchPostFromApi(id);
  }, [id]);

  /* Favoritt-knapp */
  const handleToggleLike = async () => {
    if (!post || !user) return;

    const alreadyLiked = likes.includes(user.uid);

    /* Oppdatér lokalt først */
    const updatedLikes = alreadyLiked
      ? likes.filter((u) => u !== user.uid)
      : [...likes, user.uid];

    setLikes(updatedLikes);
    setPost({ ...post, favorites: updatedLikes });

    /* Send oppdatering til Firestore */
    try {
      await postApi.toggleFavorite(post.id, user.uid, alreadyLiked);
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  /* Påmelding / avmelding */
  const handleToggleJoin = async () => {
    if (!post || !user) return;

    const currentParticipants = post.participants ?? [];
    const alreadyJoined = currentParticipants.includes(user.uid);

    /* Stopper hvis event er fullt */
    if (
      !alreadyJoined &&
      post.maxParticipants &&
      currentParticipants.length >= post.maxParticipants
    ) {
      return;
    }

    /* Oppdater liste lokalt */
    const updatedParticipants = alreadyJoined
      ? currentParticipants.filter((uid) => uid !== user.uid)
      : [...currentParticipants, user.uid];

    setPost({ ...post, participants: updatedParticipants });

    /* Oppdater deltaker-profiler lokalt */
    if (alreadyJoined) {
      setParticipantProfiles((prev) => prev.filter((p) => p.id !== user.uid));
    } else {
      setParticipantProfiles((prev) => [
        ...prev,
        { id: user.uid, name: userNameSession ?? "Anonym" },
      ]);
    }

    /* Oppdater Firestore */
    try {
      alreadyJoined
        ? await postApi.leavePost(post.id)
        : await postApi.joinPost(post.id);
    } catch (error) {
      console.error("Error updating participants:", error);
    }
  };

  /* Admin fjerner deltaker */
  const handleRemoveParticipant = async (participantId: string) => {
    if (!post) return;

    // Oppdater lokalt UI
    const updatedParticipants =
      post.participants?.filter((id) => id !== participantId) ?? [];

    setPost({ ...post, participants: updatedParticipants });
    setParticipantProfiles((prev) =>
      prev.filter((p) => p.id !== participantId)
    );

    // La postService ta seg av Firestore-oppdateringen
    try {
      await postApi.adminRemoveParticipant(post.id, participantId);
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  /* Legg til kommentar */
  const handleAddComment = async () => {
    if (!post || commentText.trim() === "") return;

    setIsLoadingAddComment(true);

    try {
      const created = await commentApi.createCommet(
        post.id,
        userNameSession ?? "Anonym",
        commentText.trim()
      );

      if (created) {
        setComments((prev) => [...prev, created]);
        setCommentText("");
      }
    } finally {
      setIsLoadingAddComment(false);
    }
  };

  /* Loading mens post hentes */
  if (isLoadingPost || post === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-text/80">Henter dugnad…</Text>
      </View>
    );
  }

  const joinedCount = post.participants?.length ?? 0;
  const maxCount =
    typeof post.maxParticipants === "number" ? post.maxParticipants : undefined;
  const userHasJoined = !!user && post.participants?.includes(user.uid);
  const isFull = !!maxCount && joinedCount >= maxCount;

  return (
    <View className="flex-1 bg-background">
      {/* Header styling */}
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#6B5448" },
          headerTintColor: "#ECE3DE",
          headerTitle: "Dugnad",
        }}
      />

      <ScrollView contentContainerClassName="pb-8">
        <View className="mt-6 mx-4 rounded-3xl bg-backgroundAlt border border-primary/30 shadow-md overflow-hidden">
          {/* Bilde */}
          <View className="relative h-56 w-full bg-background">
            {post.images?.length ? (
              <Image
                source={{ uri: post.images[0] }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={40} color="#A5B5B3" />
                <Text className="mt-2 text-xs text-accentMuted">
                  Ingen bilde lagt til
                </Text>
              </View>
            )}

            {/* Like-knapp */}
            <Pressable
              onPress={handleToggleLike}
              className="absolute top-4 right-4 h-9 w-9 rounded-full items-center justify-center bg-black/30"
            >
              <Ionicons
                name={
                  likes.includes(user?.uid ?? "") ? "heart" : "heart-outline"
                }
                size={22}
                color={likes.includes(user?.uid ?? "") ? "#dc2626" : "#ECE3DE"}
              />
            </Pressable>
          </View>

          {/* Tekst/Info blokk */}
          <View className="px-5 pt-4 pb-5">
            {post.creator && (
              <Text className="mt-2 text-[11px] text-text/60 italic">
                Opprettet av {post.creatorName ?? post.creator}
              </Text>
            )}

            <Text className="text-[22px] font-semibold text-text">
              {post.title}
            </Text>

            <Text className="mt-2 text-sm leading-relaxed text-text/80">
              {post.description}
            </Text>

            {/* Info-delen */}
            <View className="mt-4 space-y-1.5">
              {/* Kategori */}
              {post.category && (
                <Text className="text-xs text-text/80">
                  <Text className="font-semibold">Kategori: </Text>
                  {post.category}
                </Text>
              )}

              {/* Adresse + kart-konvertering */}
              {post.address && (
                <View>
                  <Text className="text-xs text-text/80">
                    <Text className="font-semibold">Sted: </Text>
                    {post.address}
                  </Text>

                  <LocationConverter
                    address={post.address}
                    handleLocation={({ coords }) => {
                      console.log("Koordinater fra visning:", coords);
                    }}
                  />
                </View>
              )}

              {/* Dato/tid */}
              {(post.date || post.time) && (
                <Text className="text-xs text-text/80">
                  <Text className="font-semibold">Tidspunkt: </Text>
                  {post.date} {post.time && `kl. ${post.time}`}
                </Text>
              )}

              {/* Påmeldte */}
              {maxCount !== undefined && (
                <View className="flex-row items-center">
                  <Text className="text-xs text-text/80">
                    <Text className="font-semibold">Påmeldt:</Text>{" "}
                    {joinedCount}/{maxCount}
                  </Text>

                  {isEventManager && joinedCount > 0 && (
                    <Pressable
                      onPress={() => setIsParticipantsModalVisible(true)}
                      className="ml-2 px-2 py-1 rounded-full bg-accent"
                    >
                      <Text className="text-[10px] text-textOnAccent">
                        Se liste
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

            {post.tasks && post.tasks.length > 0 && (
              <View className="mt-4">
                <Text className="text-xs font-semibold text-text mb-1.5">
                  Oppgaver
                </Text>
                {post.tasks.map((task, index) => (
                  <Text key={index} className="text-[11px] text-text/80 mb-0.5">
                    • {task}
                  </Text>
                ))}
              </View>
            )}

            {/* Påmelding/avmelding */}
            <Pressable
              onPress={handleToggleJoin}
              disabled={isFull && !userHasJoined}
              className={`mt-5 rounded-full px-4 py-3 items-center justify-center ${
                userHasJoined
                  ? "bg-primary"
                  : isFull
                    ? "bg-accentMuted"
                    : "bg-accent"
              }`}
            >
              <Text className="font-semibold text-textOnAccent text-sm">
                {userHasJoined
                  ? "Meld deg av"
                  : isFull
                    ? "Fullt"
                    : "Meld deg på"}
              </Text>
            </Pressable>

            {/* Antall favoritter */}
            <Text className="mt-3 text-[11px] text-text/60 self-center">
              {likes.length} {likes.length === 1 ? "favoritt" : "favoritter"}
            </Text>
          </View>

          {/* Modal med deltakere */}

          {isEventManager && (
            <Modal
              visible={isParticipantsModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setIsParticipantsModalVisible(false)}
            >
              <View className="flex-1 bg-black/40 items-center justify-center px-6">
                <View className="w-full rounded-2xl bg-backgroundAlt border border-primary/40 px-4 py-5 max-h-[70%]">
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm font-semibold">
                      Påmeldte deltakere ({joinedCount})
                    </Text>

                    <Pressable
                      onPress={() => setIsParticipantsModalVisible(false)}
                    >
                      <Ionicons name="close" size={20} color="#2F2E2C" />
                    </Pressable>
                  </View>

                  {/* Innhenting av deltakere */}
                  {isLoadingParticipants ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="small" color="#2F2E2C" />
                      <Text className="mt-2 text-xs text-text/80">
                        Laster deltakere…
                      </Text>
                    </View>
                  ) : participantProfiles.length === 0 ? (
                    <Text className="text-xs text-text/70">
                      Ingen påmeldte ennå.
                    </Text>
                  ) : (
                    /* Liste med deltakere */
                    <ScrollView className="mt-1">
                      {participantProfiles.map((p) => (
                        <View
                          key={p.id}
                          className="flex-row items-center justify-between py-1.5"
                        >
                          <Text className="text-xs">{p.name}</Text>

                          <Pressable
                            onPress={() => handleRemoveParticipant(p.id)}
                            className="px-3 py-1 rounded-full bg-primary"
                          >
                            <Text className="text-[11px] text-textOnPrimary font-semibold">
                              Fjern
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </Modal>
          )}
          {/* Kommentar-seksjon */}
          <CommentsSection
            comments={comments}
            isLoadingComments={isLoadingComments}
            commentText={commentText}
            onChangeCommentText={setCommentText}
            onAddComment={handleAddComment}
            isLoadingAddComment={isLoadingAddComment}
          />
        </View>
      </ScrollView>
    </View>
  );
}
