import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import BackButton from "../../components/backButton";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      extraScrollHeight={60}         // mueve un poco hacia arriba cuando aparece el teclado
      enableOnAndroid={true}         // asegura buen comportamiento en Android
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
      <PrimaryButton label="Restablecer contraseña" />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
});