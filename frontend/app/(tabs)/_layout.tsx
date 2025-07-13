// app/(tabs)/_layout.tsx
import { Stack,  usePathname } from "expo-router";
import BottomTabBar from "../../components/BottomTabBar";

export default function TabLayout() {

  const pathname = usePathname();
  
    // Hide tab bar on specific pages (e.g., /profile, /details, /view)
  const shouldHideTabBar = ["/profile", "/details", "/view", "/edit"].some((segment) =>
      pathname.includes(segment)
    );
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "none",}} />
      {!shouldHideTabBar && <BottomTabBar />}
    </>
  );
}