import "@/global.css";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Appearance,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  deleteNote,
  deleteNotes,
  getFolders,
  getNotes,
  moveNotesToFolder,
  setNotesPinned,
  toggleNotePinned,
  type Folder,
  type Note,
} from "@/lib/notes";
import { SwipeableNoteRow } from "@/components/SwipeableNoteRow";
import { MultiSelectActionBar } from "@/components/MultiSelectActionBar";
import { FolderPickerModal } from "@/components/FolderPickerModal";

export default function AllNotesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [movePickerOpen, setMovePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNotes = useCallback(async () => {
    const [all, allFolders] = await Promise.all([getNotes(), getFolders()]);
    setNotes(all);
    setFolders(allFolders);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes]),
  );

  const sortedNotes = useMemo(() => {
    const copy = [...notes];
    copy.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return sortAsc ? a.updatedAt - b.updatedAt : b.updatedAt - a.updatedAt;
    });
    return copy;
  }, [notes, sortAsc]);

  const visibleNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedNotes;
    return sortedNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query),
    );
  }, [sortedNotes, searchQuery]);

  const firstUnpinnedIndex = visibleNotes.findIndex((n) => !n.pinned);

  const toggleColorScheme = () => {
    Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.size === 0) setSelectMode(false);
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    if (!selectMode) setSelectMode(true);
    toggleSelected(id);
  };

  const handlePress = (note: Note) => {
    if (selectMode) {
      toggleSelected(note.id);
    } else {
      router.push({ pathname: "/note/[id]", params: { id: note.id } });
    }
  };

  const handleSingleDelete = (id: string) => {
    Alert.alert("Delete note?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(id);
          loadNotes();
        },
      },
    ]);
  };

  const handleSinglePin = async (id: string) => {
    await toggleNotePinned(id);
    loadNotes();
  };

  const selectedNotes = visibleNotes.filter((n) => selectedIds.has(n.id));
  const allSelectedPinned =
    selectedNotes.length > 0 && selectedNotes.every((n) => n.pinned);

  const handleBulkDelete = () => {
    Alert.alert(
      `Delete ${selectedIds.size} note${selectedIds.size > 1 ? "s" : ""}?`,
      "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNotes([...selectedIds]);
            exitSelectMode();
            loadNotes();
          },
        },
      ],
    );
  };

  const handleBulkTogglePin = async () => {
    await setNotesPinned([...selectedIds], !allSelectedPinned);
    exitSelectMode();
    loadNotes();
  };

  const handleBulkMove = async (folderId: string | null) => {
    await moveNotesToFolder([...selectedIds], folderId);
    setMovePickerOpen(false);
    exitSelectMode();
    loadNotes();
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {selectMode ? (
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <TouchableOpacity onPress={exitSelectMode}>
            <Text className="text-base text-blue-500">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {selectedIds.size} selected
          </Text>
          <View className="w-14" />
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              All Notes
            </Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={toggleColorScheme}>
                <Text className="text-base text-blue-500">
                  {colorScheme === "dark" ? "Light" : "Dark"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSortAsc((prev) => !prev)}>
                <Text className="text-base text-blue-500">
                  {sortAsc ? "Oldest" : "Newest"}
                </Text>
              </TouchableOpacity>
              {notes.length > 0 && (
                <TouchableOpacity onPress={() => setSelectMode(true)}>
                  <Text className="text-base text-blue-500">Select</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {notes.length > 0 && (
            <View className="flex-row items-center gap-2 px-4 pb-3">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search notes"
                placeholderTextColor={
                  colorScheme === "dark" ? "#6b7280" : "#9ca3af"
                }
                autoCorrect={false}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-base text-gray-900 dark:border-gray-800 dark:text-white"
              />
              {isSearching && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-base text-blue-500">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {notes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-400">
            No notes yet
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            Tap + to create your first note. Swipe left for quick actions.
          </Text>
        </View>
      ) : visibleNotes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-400">
            No matching notes
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            Try a different search term.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-4 gap-2"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <>
              {index === firstUnpinnedIndex && firstUnpinnedIndex > 0 && (
                <View className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
              )}
              <SwipeableNoteRow
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item.id)}
                onEdit={() =>
                  router.push({
                    pathname: "/note/[id]",
                    params: { id: item.id },
                  })
                }
                onPin={() => handleSinglePin(item.id)}
                onDelete={() => handleSingleDelete(item.id)}
                selectMode={selectMode}
                selected={selectedIds.has(item.id)}
                pinned={item.pinned}
              >
                <View className="border border-gray-200 p-4 dark:border-gray-800 min-w-0">
                  <View className="flex-row items-center gap-1 min-w-0">
                    {item.pinned && <Text className="text-xs">📌</Text>}
                    <Text
                      className="flex-1 min-w-0 text-base font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {item.title || "Untitled"}
                    </Text>
                  </View>
                  <Text
                    className="mt-1 min-w-0 text-sm text-gray-500 dark:text-gray-400"
                    numberOfLines={2}
                  >
                    {item.content || "No additional text"}
                  </Text>
                  <Text className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.updatedAt).toLocaleString()}
                  </Text>
                </View>
              </SwipeableNoteRow>
            </>
          )}
        />
      )}

      {selectMode ? (
        <MultiSelectActionBar
          count={selectedIds.size}
          allPinned={allSelectedPinned}
          onMove={() => setMovePickerOpen(true)}
          onTogglePin={handleBulkTogglePin}
          onDelete={handleBulkDelete}
        />
      ) : (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/note/[id]", params: { id: "new" } })
          }
          className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
        >
          <Text className="text-3xl leading-none text-white">+</Text>
        </TouchableOpacity>
      )}

      <FolderPickerModal
        visible={movePickerOpen}
        onClose={() => setMovePickerOpen(false)}
        folders={folders}
        currentFolderId={null}
        onSelect={handleBulkMove}
        title={`Move ${selectedIds.size} note${selectedIds.size > 1 ? "s" : ""} to`}
      />
    </View>
  );
}
