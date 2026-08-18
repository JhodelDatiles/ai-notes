import "@/global.css";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  deleteFolder,
  generateId,
  getFolders,
  toggleFolderPinned,
  upsertFolder,
  type Folder,
} from "@/lib/notes";
import { SwipeableFolderRow } from "@/components/SwipeableFolderRow";

export default function FoldersScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    const all = await getFolders();
    setFolders(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const sortedFolders = useMemo(() => {
    const copy = [...folders];
    copy.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
    return copy;
  }, [folders]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await upsertFolder({
      id: generateId(),
      name,
      pinned: false,
      createdAt: Date.now(),
    });
    setNewName("");
    load();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete folder?", "Notes inside will move to No folder.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteFolder(id);
          load();
        },
      },
    ]);
  };

  const handleTogglePin = async (id: string) => {
    await toggleFolderPinned(id);
    load();
  };

  const handleAddNote = (id: string) => {
    router.push(`/note/new?folderId=${id}`);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center gap-2 p-4">
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="New folder name"
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleCreate}
          returnKeyType="done"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-base text-gray-900 dark:border-gray-800 dark:text-white"
        />
        <TouchableOpacity
          onPress={handleCreate}
          className="rounded-lg bg-blue-500 px-4 py-2"
        >
          <Text className="font-semibold text-white">Add</Text>
        </TouchableOpacity>
      </View>

      {folders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-400">
            No folders yet
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            Create a folder above to group your notes. Swipe left for quick
            actions.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFolders}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 gap-2 pb-4"
          renderItem={({ item }) => (
            <SwipeableFolderRow
              onPress={() => router.push(`/folder/${item.id}`)}
              onAddNote={() => handleAddNote(item.id)}
              onPin={() => handleTogglePin(item.id)}
              onDelete={() => handleDelete(item.id)}
              pinned={item.pinned}
            >
              <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900 min-w-0">
                <View className="flex-row items-center gap-1 min-w-0 flex-1">
                  {item.pinned && <Text className="text-xs">📌</Text>}
                  <Text
                    className="min-w-0 flex-1 text-base font-semibold text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </View>
            </SwipeableFolderRow>
          )}
        />
      )}
    </View>
  );
}
