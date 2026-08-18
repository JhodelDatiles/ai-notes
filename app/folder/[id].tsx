import "@/global.css";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { deleteNote, getFolders, getNotes, type Note } from "@/lib/notes";
import { HoldToDeleteRow } from "@/components/HoldToDeleteRow";

export default function FolderNotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState("Folder");

  const load = useCallback(async () => {
    const [allNotes, allFolders] = await Promise.all([
      getNotes(),
      getFolders(),
    ]);
    const folder = allFolders.find((f) => f.id === id);
    setFolderName(folder?.name ?? "Folder");
    const filtered = allNotes
      .filter((n) => n.folderId === id)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(filtered);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    load();
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Stack.Screen options={{ title: folderName }} />

      {notes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-400 dark:text-gray-600">
            No notes in this folder
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-2"
          renderItem={({ item }) => (
            <HoldToDeleteRow
              onPress={() => router.push(`/note/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
            >
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <Text
                  className="text-base font-semibold text-gray-900 dark:text-white"
                  numberOfLines={1}
                >
                  {item.title || "Untitled"}
                </Text>
                <Text
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                  numberOfLines={2}
                >
                  {item.content || "No additional text"}
                </Text>
              </View>
            </HoldToDeleteRow>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push(`/note/new?folderId=${id}`)}
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
      >
        <Text className="text-3xl leading-none text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
}
