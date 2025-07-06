// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";
import BottomTabBar from "../../components/BottomTabBar";

export default function TabLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "none",}} />
      <BottomTabBar />
    </>
  );
}