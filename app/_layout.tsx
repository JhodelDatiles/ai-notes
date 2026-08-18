import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import "@/global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="note/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="folder/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
