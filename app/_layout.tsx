import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { AuthProvider } from "../hooks/useAuth";
import { hydrateAppMode, subscribeAppMode } from "../redux/persistAppMode";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    hydrateAppMode(store.dispatch);

    const unsubscribe = store.subscribe(subscribeAppMode(store));
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </AuthProvider>
    </Provider>
  );
}
