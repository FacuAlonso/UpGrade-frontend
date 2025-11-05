import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Ingresá tu email y contraseña.");
      return;
    }

    try {
      await login(email, password);
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo iniciar sesión");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      extraScrollHeight={60}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton />
      <Text style={styles.title}>Iniciar sesión</Text>

      <FormTextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <FormTextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* DEUDA TÉCNICA: FORGOT PASSWORD

      <Link href="/forgot-password">
        <Text style={styles.link}>Olvidé mi contraseña</Text>
      </Link> */}

      <PrimaryButton
        label={loading ? "Ingresando..." : "Iniciar sesión"}
        onPress={onSubmit}
      />

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  link: { color: "#22C55E", fontWeight: "600", marginBottom: 24 },
  errorText: { color: "#DC2626", textAlign: "center", marginTop: 8 },
});
