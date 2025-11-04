import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";
import { useAuth } from "../../hooks/AuthContext"; 

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth(); 
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [repeat,    setRepeat]    = useState("");
  const [loading,   setLoading]   = useState(false);

  const onSubmit = async () => {
    if (!email || !password || password !== repeat) return;
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });                          
      router.replace("/home");     
    } catch (e: any) {
      const err = e?.response?.data;
      Alert.alert("Error", err?.error ?? "No se pudo registrar");
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
      <FormTextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <FormTextInput
        placeholder="Repetir contraseña"
        secureTextEntry
        value={repeat}
        onChangeText={setRepeat}
        invalid={!!repeat && repeat !== password}
      />

      <PrimaryButton label={loading ? "Creando..." : "Registrarse"} onPress={onSubmit} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});
