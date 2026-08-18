import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
} from "react-native";
import type { Folder } from "@/lib/notes";

export function FolderPickerModal({
  visible,
  onClose,
  folders,
  currentFolderId,
  onSelect,
  title = "Move to folder",
}: {
  visible: boolean;
  onClose: () => void;
  folders: Folder[];
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  title?: string;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-2xl bg-white p-4 dark:bg-gray-900"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </Text>
          <FlatList
            data={[
              { id: null, name: "No folder" } as unknown as Folder,
              ...folders,
            ]}
            keyExtractor={(item) => item.id ?? "none"}
            contentContainerClassName="gap-1 pb-4"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item.id)}
                className={`rounded-lg px-3 py-3 ${
                  item.id === currentFolderId
                    ? "bg-blue-50 dark:bg-blue-950/40"
                    : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    item.id === currentFolderId
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
