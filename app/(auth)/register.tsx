import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [repeat,    setRepeat]    = useState("");

  const onSubmit = () => {
    if (!email || !password || password !== repeat) return;
    router.replace("/home");
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

      <PrimaryButton label="Registrarse" onPress={onSubmit} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});
