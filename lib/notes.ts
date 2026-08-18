import AsyncStorage from "@react-native-async-storage/async-storage";

export type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Folder = {
  id: string;
  name: string;
  pinned: boolean;
  createdAt: number;
};

const NOTES_KEY = "notes";
const FOLDERS_KEY = "folders";

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Notes ---

export async function getNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Note[];
    // Default pinned for notes saved before this field existed
    return parsed.map((n) => ({ ...n, pinned: n.pinned ?? false }));
  } catch {
    return [];
  }
}

async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function upsertNote(note: Note): Promise<void> {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  await saveNotes(notes);
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();
  await saveNotes(notes.filter((n) => n.id !== id));
}

export async function deleteNotes(ids: string[]): Promise<void> {
  const notes = await getNotes();
  const idSet = new Set(ids);
  await saveNotes(notes.filter((n) => !idSet.has(n.id)));
}

export async function toggleNotePinned(id: string): Promise<void> {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx >= 0) {
    notes[idx] = { ...notes[idx], pinned: !notes[idx].pinned };
    await saveNotes(notes);
  }
}

export async function setNotesPinned(
  ids: string[],
  pinned: boolean,
): Promise<void> {
  const notes = await getNotes();
  const idSet = new Set(ids);
  const updated = notes.map((n) => (idSet.has(n.id) ? { ...n, pinned } : n));
  await saveNotes(updated);
}

export async function moveNotesToFolder(
  ids: string[],
  folderId: string | null,
): Promise<void> {
  const notes = await getNotes();
  const idSet = new Set(ids);
  const updated = notes.map((n) => (idSet.has(n.id) ? { ...n, folderId } : n));
  await saveNotes(updated);
}

// --- Folders ---

export async function getFolders(): Promise<Folder[]> {
  const raw = await AsyncStorage.getItem(FOLDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Folder[];
    // Default pinned for folders saved before this field existed
    return parsed.map((f) => ({ ...f, pinned: f.pinned ?? false }));
  } catch {
    return [];
  }
}

async function saveFolders(folders: Folder[]): Promise<void> {
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export async function upsertFolder(folder: Folder): Promise<void> {
  const folders = await getFolders();
  const idx = folders.findIndex((f) => f.id === folder.id);
  if (idx >= 0) folders[idx] = folder;
  else folders.unshift(folder);
  await saveFolders(folders);
}

export async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  await saveFolders(folders.filter((f) => f.id !== id));

  const notes = await getNotes();
  const updated = notes.map((n) =>
    n.folderId === id ? { ...n, folderId: null } : n,
  );
  await saveNotes(updated);
}

export async function toggleFolderPinned(id: string): Promise<void> {
  const folders = await getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx >= 0) {
    folders[idx] = { ...folders[idx], pinned: !folders[idx].pinned };
    await saveFolders(folders);
  }
}
