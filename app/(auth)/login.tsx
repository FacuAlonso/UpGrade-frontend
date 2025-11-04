import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";
import { useAuth } from "../../hooks/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    if (!email || !password) return;
    try {
      await login(email.trim(), password); 
      router.replace("/home");           
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo iniciar sesión");
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

      <Link href="/forgot-password">
        <Text style={styles.link}>Olvidé mi contraseña</Text>
      </Link>

      <PrimaryButton label="Iniciar sesión" onPress={onSubmit} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  link: { color: "#22C55E", fontWeight: "600", marginBottom: 24 },
});
