import { CommentObject } from "../types/CommentData";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "firebaseConfig";

export async function createCommet(
  postId: string,
  author: string,
  commentText: string
): Promise<CommentObject | null> {
  try {
    const data = {
      author,
      comment: commentText,
    };

    const docRef = await addDoc(collection(db, "comments"), data);

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(docRef.id),
    });

    console.log("Comment created with ID: ", docRef.id);

    return {
      id: docRef.id,
      author,
      comment: commentText,
    };
  } catch (e) {
    console.log("Error creating comment", e);
    return null;
  }
}

export async function getCommentsByIds(ids: string[]) {
  try {
    // henter ut alle kommentarer og plukker ut de som matcher idenee i parameteret
    const queryResult = await getDocs(collection(db, "comments"));
    const targetComments = queryResult.docs.filter((doc) =>
      ids.includes(doc.id)
    );
    const comments = targetComments.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as CommentObject
    );
    console.log("Successfully fetched comments: ", comments);
    return comments;
  } catch (e) {
    console.log("Error fetching all comments", e);
    return [] as CommentObject[];
  }
}
