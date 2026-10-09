import { AntDesign } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";
import { Button, Platform, Text, TouchableOpacity, View } from "react-native";
import * as Device from "expo-device";

type SelectImageModalProps = {
  closeModal: VoidFunction;
  setImages: (SetImages: string[]) => void;
  currentImages: string[];
};

export default function SelectImages({
  closeModal,
  setImages,
  currentImages,
}: SelectImageModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isOSSimulator =
    (Platform.OS === "ios" && !Device.isDevice) ||
    (Platform.OS === "android" && !Device.isDevice);

  if (!permission && !isOSSimulator) {
    console.log("No permission object");
    return <View />;
  }

  if (!isOSSimulator && permission && !permission.granted) {
    console.log("Permission not granted");
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center mb-3">
          Vi trenger tillatelse til å bruke kameraet
        </Text>
        <View className="w-full max-w-xs">
          <Button onPress={requestPermission} title="Gi tillatelse" />
        </View>
      </View>
    );
  }

  let camera: CameraView | null = null;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages([...currentImages, ...uris]);
      closeModal();
    }
  };

  const captureImage = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setImages([...currentImages, photo.uri]);
      closeModal();
    }
  };

  return (
    <View className="flex-1 justify-center">
      <CameraView className="flex-1" facing="back" ref={cameraRef} />
      <View className="absolute bottom-16 left-0 right-0 px-16 flex-row">
        <TouchableOpacity
          className="flex-1 items-center"
          onPress={() => closeModal()}
        >
          <AntDesign name="close" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center"
          disabled={isOSSimulator}
          onPress={!isOSSimulator ? captureImage : undefined}
          accessibilityState={{ disabled: isOSSimulator }}
        >
          <AntDesign name="camera" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center"
          onPress={() => pickImage()}
        >
          <AntDesign name="picture" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
