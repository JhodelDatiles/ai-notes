import { useRef } from "react";
import { Animated, Pressable, View } from "react-native";

const HOLD_DURATION = 700;

export function HoldToDeleteRow({
  onPress,
  onDelete,
  children,
}: {
  onPress?: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  const startHold = () => {
    progress.setValue(0);
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    animation.current.start(({ finished }) => {
      if (finished) onDelete();
    });
  };

  const cancelHold = () => {
    animation.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={startHold} onPressOut={cancelHold}>
      <View className="overflow-hidden rounded-xl min-w-0">
        {children}
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-end bg-red-500/80 pb-2"
          style={{
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </Pressable>
  );
}
