import { Swipeable } from "react-native-gesture-handler";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export function SwipeableFolderRow({
  onAddNote,
  onPin,
  onDelete,
  onPress,
  pinned,
  children,
}: {
  onAddNote: () => void;
  onPin: () => void;
  onDelete: () => void;
  onPress: () => void;
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
          onPress={onAddNote}
          className="w-16 items-center justify-center bg-blue-500"
        >
          <Text className="text-xs font-semibold text-white">Add Note</Text>
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
        renderRightActions={renderRightActions}
        overshootRight={false}
        rightThreshold={40}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="bg-gray-50 dark:bg-gray-900 min-w-0"
        >
          {children}
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}
