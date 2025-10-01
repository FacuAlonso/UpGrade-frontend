import { Tabs } from "expo-router";

export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,          
        tabBarActiveTintColor: "#22C55E",
        tabBarLabelStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Inicio" }} />
      <Tabs.Screen name="search-teachers" options={{ title: "Buscar" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
