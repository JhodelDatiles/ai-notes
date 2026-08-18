import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function MultiSelectActionBar({
  count,
  allPinned,
  onMove,
  onTogglePin,
  onDelete,
}: {
  count: number;
  allPinned: boolean;
  onMove: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const disabledColor = isDark ? "#4b5563" : "#d1d5db";

  return (
    <View className="flex-row items-center justify-around border-t border-gray-200 bg-white px-2 py-3 dark:border-gray-800 dark:bg-gray-950">
      <TouchableOpacity
        onPress={onMove}
        disabled={count === 0}
        className="items-center gap-1"
      >
        <Ionicons
          name="folder-outline"
          size={22}
          color={count === 0 ? disabledColor : "#3b82f6"}
        />
        <Text
          className={`text-xs ${
            count === 0 ? "text-gray-300 dark:text-gray-700" : "text-blue-500"
          }`}
        >
          Move
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onTogglePin}
        disabled={count === 0}
        className="items-center gap-1"
      >
        <Ionicons
          name={allPinned ? "pin" : "pin-outline"}
          size={22}
          color={count === 0 ? disabledColor : "#f59e0b"}
        />
        <Text
          className={`text-xs ${
            count === 0 ? "text-gray-300 dark:text-gray-700" : "text-amber-500"
          }`}
        >
          {allPinned ? "Unpin" : "Pin"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        disabled={count === 0}
        className="items-center gap-1"
      >
        <Ionicons
          name="trash-outline"
          size={22}
          color={count === 0 ? disabledColor : "#ef4444"}
        />
        <Text
          className={`text-xs ${
            count === 0 ? "text-gray-300 dark:text-gray-700" : "text-red-500"
          }`}
        >
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );
}
