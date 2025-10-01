import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding" })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <BackButton />
        <Text style={styles.title}>Olvidé mi contraseña</Text>
        <FormTextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <PrimaryButton label="Restablecer contraseña" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});
