import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function MainTabsLayout() {
  const { isLoggedIn } = useAuth();
  const mode = useSelector((s: RootState) => s.appMode.mode);

  if (!isLoggedIn) return <Redirect href="/login" />;

  return (
    <Tabs
      key={mode}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontWeight: "600" },
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: mode === "student" ? undefined : null,
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search-teachers"
        options={{
          href: mode === "student" ? undefined : null,
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tutor-lessons"
        options={{
          href: mode === "tutor" ? undefined : null,
          title: "Mis clases",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-classes"
        options={{
          href: mode === "tutor" ? undefined : null,
          title: "Crear clases",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
