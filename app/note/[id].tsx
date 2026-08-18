import "@/global.css";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteNote,
  generateId,
  getFolders,
  getNotes,
  upsertNote,
  type Folder,
} from "@/lib/notes";

export default function NoteScreen() {
  const { id, folderId: initialFolderId } = useLocalSearchParams<{
    id: string;
    folderId?: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState<string | null>(
    initialFolderId ?? null,
  );
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loaded, setLoaded] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);

  const noteIdRef = useRef(isNew ? generateId() : id);
  const createdAtRef = useRef(Date.now());
  const updatedAtRef = useRef(Date.now());
  const pinnedRef = useRef(false);
  const prevRef = useRef({ title, content, folderId });
  const isFirstRun = useRef(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const notes = await getNotes();
      const existing = notes.find((n) => n.id === id);
      if (existing) {
        setTitle(existing.title);
        setContent(existing.content);
        setFolderId(existing.folderId);
        createdAtRef.current = existing.createdAt;
        updatedAtRef.current = existing.updatedAt;
        pinnedRef.current = existing.pinned;
      }
      setLoaded(true);
    })();
  }, [id, isNew]);

  useEffect(() => {
    (async () => {
      const allFolders = await getFolders();
      setFolders(allFolders);
    })();
  }, []);

  // Autosave — only bumps updatedAt when title/content actually change.
  // Folder moves persist silently without touching the date.
  useEffect(() => {
    if (!loaded) return;
    if (!title.trim() && !content.trim()) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      prevRef.current = { title, content, folderId };
      return;
    }

    const prev = prevRef.current;
    const contentChanged = prev.title !== title || prev.content !== content;
    prevRef.current = { title, content, folderId };

    const timeout = setTimeout(() => {
      if (contentChanged) updatedAtRef.current = Date.now();
      upsertNote({
        id: noteIdRef.current,
        title,
        content,
        folderId,
        pinned: pinnedRef.current,
        createdAt: createdAtRef.current,
        updatedAt: updatedAtRef.current,
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [title, content, folderId, loaded]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Nothing to save", "Add a title or some content first.");
      return;
    }
    setIsSaving(true);
    const prev = prevRef.current;
    const contentChanged = prev.title !== title || prev.content !== content;
    if (contentChanged) updatedAtRef.current = Date.now();
    await upsertNote({
      id: noteIdRef.current,
      title,
      content,
      folderId,
      pinned: pinnedRef.current,
      createdAt: createdAtRef.current,
      updatedAt: updatedAtRef.current,
    });
    setIsSaving(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete note?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(noteIdRef.current);
          router.back();
        },
      },
    ]);
  };

  if (!loaded) return <View className="flex-1 bg-white dark:bg-gray-950" />;

  const currentFolderName =
    folders.find((f) => f.id === folderId)?.name ?? "No folder";

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Stack.Screen
        options={{
          headerTitle: isNew ? "New Note" : "Edit Note",
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="px-2"
              >
                <Text className="text-base font-semibold text-blue-500">
                  {isSaving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
              {!isNew && (
                <TouchableOpacity onPress={handleDelete} className="px-2">
                  <Text className="text-base text-red-500">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <TouchableOpacity
        onPress={() => setPickerOpen(true)}
        className="mx-4 mt-3 self-start rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800"
      >
        <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
          📁 {currentFolderName}
        </Text>
      </TouchableOpacity>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
        className="px-4 pt-3 text-2xl font-bold text-gray-900 dark:text-white"
      />
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Start writing..."
        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
        multiline
        textAlignVertical="top"
        className="flex-1 px-4 py-2 text-base text-gray-700 dark:text-gray-300"
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setPickerOpen(false)}
        >
          <Pressable
            className="rounded-t-2xl bg-white p-4 dark:bg-gray-900"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Move to folder
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
                  onPress={() => {
                    setFolderId(item.id);
                    setPickerOpen(false);
                  }}
                  className={`rounded-lg px-3 py-3 ${
                    item.id === folderId ? "bg-blue-50 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      item.id === folderId
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
    </View>
  );
}
