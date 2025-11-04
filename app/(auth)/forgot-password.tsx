import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";
import { API_URL } from "../../config"; 

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      
      const resp = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo enviar el correo");
      }

      Alert.alert("Listo", "Si el email existe, te enviamos instrucciones para restablecer la contraseña.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "No se pudo enviar el correo");
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
      <Text style={styles.title}>Olvidé mi contraseña</Text>
      <FormTextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <PrimaryButton label={loading ? "Enviando..." : "Restablecer contraseña"} onPress={onSubmit} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});
