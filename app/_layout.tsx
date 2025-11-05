import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

export default function RootLayout() {
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
