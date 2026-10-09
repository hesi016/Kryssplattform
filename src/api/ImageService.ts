import { getDownloadURL, uploadBytes } from "firebase/storage";
import { getStorageRef } from "firebaseConfig";

export async function uploadImageToFirebase(uri: string) {
  const fetchResponse = await fetch(uri);
  const blob = await fetchResponse.blob();

  const imageName = uri.split("/").pop()?.split(".")[0] ?? "anonymtBilde";
  console.log("imageName", imageName);
  const uploadPath = `bilder/${imageName}`;

  const imageRef = await getStorageRef(uploadPath);

  try {
    await uploadBytes(imageRef, blob);
    console.log("Uploading image to", uploadPath);
    const downloadURL = await getDownloadURL(imageRef);
    console.log("Download URL:", downloadURL);
    return downloadURL;
  } catch (e) {
    console.error("error uploading image", e);
    return "ERROR";
  }
}
