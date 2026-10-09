import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthSession } from "../providers/authContext";
import { EventData } from "../types/EventData";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import CategoryPicker from "./CategoryPicker";
import SelectImages from "./SelectImages";

export type EventFormModalProps = {
  addNewEvent: (post: EventData) => Promise<void>;
  closeModal: () => void;
  editingEvent?: EventData | null;
  onUpdateEvent?: (post: EventData) => void;
};

export default function PostFormModal({
  addNewEvent,
  closeModal,
  editingEvent,
  onUpdateEvent,
}: EventFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tasks, setTasks] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{
    coords: any;
    address: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { userNameSession } = useAuthSession();
  const isEditMode = !!editingEvent;

  // Fyll inn / nullstill skjema når editingEvent endres
  useEffect(() => {
    if (!editingEvent) {
      resetForm();
      return;
    }

    setTitle(editingEvent.title || "");
    setDescription(editingEvent.description || "");
    setImages(editingEvent.images || []);
    setSelectedCategory(editingEvent.category || "");
    setDate(editingEvent.date || "");
    setTime(editingEvent.time || "");
    setTasks(
      editingEvent.tasks && editingEvent.tasks.length > 0
        ? editingEvent.tasks.join("\n")
        : ""
    );
    setMaxParticipants(
      editingEvent.maxParticipants != null
        ? String(editingEvent.maxParticipants)
        : ""
    );
    setAddress(editingEvent.address || "");
    setLocation(
      editingEvent.location
        ? { coords: editingEvent.location, address: editingEvent.address || "" }
        : null
    );
    setErrorMsg(null);
  }, [editingEvent]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImages([]);
    setSelectedCategory("");
    setDate("");
    setTime("");
    setTasks("");
    setMaxParticipants("");
    setAddress("");
    setLocation(null);
    setErrorMsg(null);
  };

  // sjekker om brukeren har fylt ut punktet
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setErrorMsg("Tittel er påkrevd");
      return false;
    }

    if (!description.trim()) {
      setErrorMsg("Beskrivelse er påkrevd");
      return false;
    }

    if (!selectedCategory) {
      setErrorMsg("Kategori er påkrevd");
      return false;
    }

    if (!date.trim()) {
      setErrorMsg("Dato er påkrevd");
      return false;
    }

    if (!time.trim()) {
      setErrorMsg("Tidspunkt er påkrevd");
      return false;
    }

    if (!address.trim() && !location?.address) {
      setErrorMsg("Adresse er påkrevd");
      return false;
    }

    if (!maxParticipants.trim()) {
      setErrorMsg("Antall deltakere er påkrevd");
      return false;
    }

    const parsedMax = Number(maxParticipants);
    if (isNaN(parsedMax) || parsedMax <= 0) {
      setErrorMsg("Antall deltakere må være et positivt tall");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!validateForm()) {
      return;
    }

    const parsedMaxParticipants = Number(maxParticipants);

    const tasksArray = tasks
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    // Felles felter for både create + edit
    const commonFields: Partial<EventData> = {
      title,
      description,
      images: images ?? [],
      location: location?.coords || null,
      address: location?.address || address,
      category: selectedCategory,
      tasks: tasksArray,
      maxParticipants: parsedMaxParticipants,
      date,
      time,
    };

    setIsLoading(true);
    try {
      if (isEditMode && editingEvent && onUpdateEvent) {
        // Oppdaterer eksisterende arrangement
        const updatedEvent: EventData = {
          ...editingEvent,
          ...commonFields,
        };
        onUpdateEvent(updatedEvent);
      } else {
        // Lager nytt arrangement
        const newEvent: EventData = {
          id: `eventName-${Date.now()}-${title.replace(/\s+/g, "-")}`,
          creator: userNameSession || "Anonym",
          favorites: [],
          comments: [],
          participants: [],
          createdAt: Date.now(),
          ...commonFields,
        } as EventData;

        await addNewEvent(newEvent);
        resetForm();
      }

      closeModal();
    } catch (e) {
      setErrorMsg(
        isEditMode
          ? "Noe gikk galt ved oppdatering av dugnad."
          : "Noe gikk galt ved opprettelse av dugnad."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Toppbar */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-primary/20 bg-primary">
        <Text className="text-lg font-semibold text-textOnPrimary">
          {isEditMode ? "Rediger dugnad" : "Ny dugnad"}
        </Text>
      </View>

      {/* Modal for kameravelger */}
      <Modal visible={isCameraOpen} animationType="slide">
        <SelectImages
          closeModal={() => setIsCameraOpen(false)}
          setImages={setImages}
          currentImages={images}
        />
      </Modal>

      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
          <Text className="mt-3 text-text text-sm opacity-80">
            {isEditMode ? "Lagrer endringer …" : "Lager dugnad …"}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 py-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-backgroundAlt rounded-2xl shadow-md shadow-black/10 p-6 border border-primary/20">
            {/* Legge inn bildeboks */}
            <Pressable
              onPress={() => setIsCameraOpen(true)}
              className="rounded-xl border-2 border-dashed border-accentMuted bg-background h-52 justify-center items-center mb-6"
            >
              <EvilIcons name="image" size={80} color="#A5B5B3" />
              <Text className="text-text mt-2 opacity-70">
                Trykk for å legge til bilder
              </Text>
            </Pressable>

            {/* Se bilde/bildene */}
            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row mb-6"
              >
                {images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-28 h-28 rounded-lg mr-3 border border-accentMuted"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {/* Skjema-felter */}
            <View className="pt-2">
              {/* Tittel */}
              <View className="mt-1">
                <Text className="text-xs font-semibold text-primary mb-1">
                  * Tittel
                </Text>
                <TextInput
                  className="border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm"
                  value={title}
                  placeholder="Navn på dugnaden..."
                  placeholderTextColor="#A5B5B3"
                  onChangeText={setTitle}
                />
              </View>

              {/* Beskrivelse */}
              <View className="mt-4">
                <Text className="text-xs font-semibold text-primary mb-1">
                  * Beskrivelse
                </Text>
                <TextInput
                  className="border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm h-28"
                  value={description}
                  multiline
                  onChangeText={setDescription}
                  placeholder="Skriv litt om dugnaden…"
                  placeholderTextColor="#A5B5B3"
                />
              </View>

              {/* Kategori */}
              <View className="mt-5">
                <Text className="text-xs font-semibold text-primary mb-1">
                  * Kategori
                </Text>
                <CategoryPicker
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </View>

              {/* Oppgaver */}
              <View className="mt-5">
                <Text className="text-xs font-semibold text-primary mb-2">
                  Ting som skal gjøres:
                </Text>
                <TextInput
                  className="border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm h-28"
                  value={tasks}
                  onChangeText={setTasks}
                  multiline
                  placeholder="Skriv én oppgave per linje"
                  placeholderTextColor="#A5B5B3"
                />
              </View>

              {/* Dato og tidspunkt */}
              <View className="mt-5 flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-primary mb-1">
                    * Dato
                  </Text>
                  <TextInput
                    className="border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm"
                    placeholder="18.11.2025"
                    placeholderTextColor="#A5B5B3"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-semibold text-primary mb-1">
                    * Tidspunkt
                  </Text>
                  <TextInput
                    className="border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm"
                    placeholder="18:00"
                    placeholderTextColor="#A5B5B3"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>

              {/* Adresse */}
              <View className="mt-5">
                <Text className="text-xs font-semibold text-primary mb-1">
                  * Adresse
                </Text>
                <View className="flex-row items-center gap-2">
                  <EvilIcons name="location" size={22} color="#A5B5B3" />
                  <TextInput
                    className="flex-1 border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm"
                    placeholder="Skriv inn adresse, f.eks. Skoleveien 5"
                    placeholderTextColor="#A5B5B3"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              {/* Antall deltakere */}
              <View className="mt-5">
                <Text className="text-xs font-semibold text-primary mb-1">
                  * Hvor mange kan melde seg på?
                </Text>
                <TextInput
                  className="w-24 border border-primary/30 rounded-2xl px-4 py-3 bg-background text-text text-sm"
                  keyboardType="numeric"
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  placeholder="20"
                  placeholderTextColor="#A5B5B3"
                />
              </View>

              {/* Feilmelding */}
              {errorMsg && (
                <View className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl">
                  <Text className="text-sm text-red-600 font-medium">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Knapper nederst */}
              <View className="mt-6 flex-row">
                {/* Avbryt-knapp til venstre */}
                <Pressable
                  onPress={closeModal}
                  className="flex-1 mr-3 rounded-full border border-primary/40 px-5 py-3 items-center justify-center bg-background"
                >
                  <Text className="font-semibold text-primary text-sm">
                    Avbryt
                  </Text>
                </Pressable>

                {/* Opprett / Lagre-knapp til høyre */}
                <Pressable
                  className="flex-1 rounded-full bg-primary px-5 py-3 items-center justify-center shadow-md shadow-primary/40"
                  onPress={handleSubmit}
                >
                  <Text className="font-semibold text-textOnPrimary text-sm">
                    {isEditMode ? "Lagre endringer" : "Opprett"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
