import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!firstName || !lastName || !email || !password || !repeat) {
      Alert.alert("Faltan datos", "Completá todos los campos.");
      return;
    }
    if (password !== repeat) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar el usuario");
      await login(email, password);
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
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
      <Text style={styles.title}>Crear una cuenta</Text>

      <FormTextInput placeholder="Nombre/s" value={firstName} onChangeText={setFirstName} />
      <FormTextInput placeholder="Apellido/s" value={lastName} onChangeText={setLastName} />
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
      <FormTextInput
        placeholder="Repetir contraseña"
        secureTextEntry
        value={repeat}
        onChangeText={setRepeat}
        invalid={!!repeat && repeat !== password}
      />

      <PrimaryButton
        label={loading ? "Creando cuenta..." : "Registrarse"}
        onPress={onSubmit}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});
