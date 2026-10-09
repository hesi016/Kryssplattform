import React, { useState } from "react";
import { View, Text, Modal, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type CategoryPickerProps = {
  value: string;
  onChange: (value: string) => void;
  showAllOptions?: boolean;
};

const CATEGORIES = [
  "Renhold & Vedlikehold",
  "Utearbeid & Hage",
  "Arrangementer & Sosialt",
  "Sport & Idrettslag",
  "Diverse",
];

export default function CategoryPicker({
  value,
  onChange,
  showAllOptions = false,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = value && value.length > 0 ? value : "Alle kategorier";

  return (
    <View>
      {/* Filter-knapp */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between 
                   bg-backgroundAlt border border-primary/30 
                   rounded-2xl px-3 py-3"
      >
        <View className="flex-row items-center">
          <Ionicons name="menu" size={18} color="#6B5448" />
        </View>

        <Text className="text-text/70 text-xs" numberOfLines={1}>
          {currentLabel}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          {/* Modal-boks */}
          <View
            className="w-11/12 max-w-md 
                          bg-backgroundAlt rounded-2xl p-4 
                          border border-primary/30 shadow-lg shadow-black/30"
          >
            <Text className="text-text font-semibold text-base mb-3">
              Velg kategori
            </Text>

            {/* "Alle kategorier" */}
            {showAllOptions && (
              <TouchableOpacity
                className="py-2.5"
                onPress={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                <Text className="text-text text-sm">Alle kategorier</Text>
              </TouchableOpacity>
            )}

            {/* Liste med kategorier */}
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                className="py-2.5"
                onPress={() => {
                  onChange(cat);
                  setIsOpen(false);
                }}
              >
                <Text
                  className={`text-sm ${
                    value === cat ? "text-primary font-semibold" : "text-text"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Lukke-knapp */}
            <View className="mt-3 items-end">
              <Pressable onPress={() => setIsOpen(false)}>
                <Text className="text-text/70 text-sm">Lukk</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
