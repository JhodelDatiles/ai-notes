import { Swipeable } from "react-native-gesture-handler";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export function SwipeableNoteRow({
  onEdit,
  onPin,
  onDelete,
  onPress,
  onLongPress,
  selectMode,
  selected,
  pinned,
  children,
}: {
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
  onPress: () => void;
  onLongPress: () => void;
  selectMode: boolean;
  selected: boolean;
  pinned: boolean;
  children: React.ReactNode;
}) {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [192, 0],
    });
    return (
      <Animated.View
        style={{ transform: [{ translateX }] }}
        className="flex-row"
      >
        <TouchableOpacity
          onPress={onEdit}
          className="w-16 items-center justify-center bg-blue-500"
        >
          <Text className="text-xs font-semibold text-white">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPin}
          className="w-16 items-center justify-center bg-amber-500"
        >
          <Text className="text-xs font-semibold text-white">
            {pinned ? "Unpin" : "Pin"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="w-16 items-center justify-center bg-red-500"
        >
          <Text className="text-xs font-semibold text-white">Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="overflow-hidden rounded-xl min-w-0">
      <Swipeable
        enabled={!selectMode}
        renderRightActions={renderRightActions}
        overshootRight={false}
        rightThreshold={40}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 bg-gray-50 dark:bg-gray-900 min-w-0"
        >
          {selectMode && (
            <View
              className={`ml-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}
            >
              {selected && (
                <Text className="text-xs font-bold text-white">✓</Text>
              )}
            </View>
          )}
          <View className="flex-1 min-w-0">{children}</View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}
