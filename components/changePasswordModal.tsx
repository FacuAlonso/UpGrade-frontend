import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AppTextInput from "./formTextInput";
import PrimaryButton from "./primaryButton";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: { current: string; next: string }) => void;
};

export default function ChangePasswordModal({ visible, onClose, onSave }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (next.length < 6) return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    if (next !== repeat) return setError("Las contraseñas no coinciden.");
    setError(null);
    onSave({ current, next });
    onClose();
    setCurrent(""); setNext(""); setRepeat("");
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Cambiar contraseña</Text>

          <AppTextInput placeholder="Contraseña actual" secureTextEntry value={current} onChangeText={setCurrent}/>
          <AppTextInput placeholder="Nueva contraseña" secureTextEntry value={next} onChangeText={setNext}/>
          <AppTextInput placeholder="Repetir nueva contraseña" secureTextEntry value={repeat} onChangeText={setRepeat}/>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable onPress={onClose}><Text style={styles.cancel}>Cancelar</Text></Pressable>
            <PrimaryButton label="Guardar" onPress={handleSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: spacing.xl },
  card: { width: "100%", maxWidth: 420, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, elevation: 4 },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.m },
  error: { color: "#DC2626", marginTop: spacing.s },
  actions: { marginTop: spacing.l, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.m },
  cancel: { color: colors.muted, fontWeight: "600", paddingVertical: spacing.s, paddingHorizontal: spacing.m },
});