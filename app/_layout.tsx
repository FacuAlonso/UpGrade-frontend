import { Stack } from "expo-router";
import React from "react";
import { AuthProvider, useAuth } from "../hooks/AuthContext";
import { View, ActivityIndicator } from "react-native";

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
