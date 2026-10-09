import { uploadImageToFirebase } from "./ImageService";
import { EventData } from "@/src/types/EventData";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "firebaseConfig";
import { getUserProfile } from "./userService";

// Oppretter et nytt innlegg (dugnad)
export const createPost = async (post: EventData) => {
  try {
    // Kun EventManagers kan lage innlegg
    await assertEventManager();

    const user = auth.currentUser!;
    const uploadedImageUrls: string[] = [];

    // Laster opp alle bildene som hører til innlegget
    if (Array.isArray(post.images) && post.images.length > 0) {
      for (const uri of post.images) {
        if (!uri) continue;
        const downloadUrl = await uploadImageToFirebase(uri);
        if (!downloadUrl) {
          console.warn(`Image upload failed for ${uri}`);
          continue;
        }
        uploadedImageUrls.push(downloadUrl);
      }
    }

    // Henter navn på bruker som oppretter innlegget
    const profile = await getUserProfile(user.uid);

    const postWithImages: EventData = {
      ...post,
      images: uploadedImageUrls,
      creator: user.uid,
      creatorName: profile?.name ?? user.displayName ?? user.email ?? "Anonym",
      createdAt: Date.now(),
    };

    // Lagrer innlegget i Firestore
    const docRef = await addDoc(collection(db, "posts"), postWithImages);

    // Legger til id-feltet manuelt etterpå
    const postWithId = { ...postWithImages, id: docRef.id };
    await updateDoc(docRef, postWithId);

    return postWithId;
  } catch (e) {
    console.error("Error adding document", e);
    throw e;
  }
};

// Henter alle innlegg
export const getAllPosts = async () => {
  const queryResult = await getDocs(collection(db, "posts"));
  return queryResult.docs.map((doc) => {
    return { ...doc.data(), id: doc.id } as EventData;
  });
};

// Henter ett spesifikt innlegg basert på id
export const getPostById = async (id: string) => {
  const specificPost = await getDoc(doc(db, "posts", id));
  return {
    ...specificPost.data(),
    id: specificPost.id,
  } as EventData;
};

// Sletter et innlegg (kun EventManager)
export const deletePost = async (id: string) => {
  try {
    await assertEventManager();
    await deleteDoc(doc(db, "posts", id));
  } catch (e) {
    console.error("Error removing document: ", e);
  }
};

// Oppdaterer et eksisterende innlegg
export const updatePost = async (
  postId: string,
  updateData: Partial<EventData>
) => {
  try {
    await assertEventManager();
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error("Error updating post:", error);
  }
};

// Henter innlegg filtrert på kategori direkte fra Firestore
export const getRemoteFilteredPosts = async (
  category = ""
): Promise<EventData[]> => {
  let q = query(collection(db, "posts"));

  if (category) {
    q = query(q, where("category", "==", category));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as EventData),
    id: docSnap.id,
  }));
};

// Henter alle innlegg og filtrerer søket lokalt
export const getLocalSearchedPosts = async (
  searchQuery = ""
): Promise<EventData[]> => {
  const snapshot = await getDocs(collection(db, "posts"));

  let posts: EventData[] = snapshot.docs.map((doc) => ({
    ...(doc.data() as EventData),
    id: doc.id,
  }));

  // Filtrer basert på tekst
  if (searchQuery.trim()) {
    const lower = searchQuery.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    );
  }

  return posts;
};

// Henter alle arrangementene til en bestemt bruker
export const getUserPosts = async (userId: string): Promise<EventData[]> => {
  const q = query(collection(db, "posts"), where("creator", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as EventData),
    id: docSnap.id,
  }));
};

// Sjekker at bruker er EventManager
async function assertEventManager() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  const profile = await getUserProfile(user.uid);

  if (profile?.role !== "EventManager") {
    throw new Error("Not authorized. Only EventManagers can manage posts.");
  }
}

// Melder bruker på et arrangement
export const joinPost = async (postId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    participants: arrayUnion(user.uid),
  });
};

// Melder bruker av et arrangement
export const leavePost = async (postId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    participants: arrayRemove(user.uid),
  });
};

// Legger til eller fjerner en favoritt
export const toggleFavorite = async (
  postId: string,
  userId: string,
  alreadyLiked: boolean
) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    favorites: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

// Henter alle favoritt-innlegg for en bruker
export const getFavoriteEventsForUser = async (
  userId: string
): Promise<EventData[]> => {
  const q = query(
    collection(db, "posts"),
    where("favorites", "array-contains", userId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as EventData),
    id: doc.id,
  }));
};

// Admin: fjerner en deltaker manuelt
export const adminRemoveParticipant = async (
  postId: string,
  participantId: string
) => {
  await assertEventManager();
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    participants: arrayRemove(participantId),
  });
};

// Henter alle arrangementer en bruker er påmeldt i
export const getEventsUserJoined = async (
  userId: string
): Promise<EventData[]> => {
  const q = query(
    collection(db, "posts"),
    where("participants", "array-contains", userId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as EventData),
    id: docSnap.id,
  }));
};
