import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AppTextInput from "./formTextInput";
import PrimaryButton from "./primaryButton";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

type Props = {
  visible: boolean;
  label: string;
  placeholder?: string;
  initialValue: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function EditFieldModal({
  visible, label, placeholder, initialValue, keyboardType = "default",
  onClose, onSave,
}: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (visible) setValue(initialValue); }, [visible, initialValue]);

  const handleSave = () => { onSave(value.trim() || initialValue); onClose(); };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{label}</Text>
          <AppTextInput
            placeholder={placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType={keyboardType}
            returnKeyType="done"
            autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          />
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
  actions: { marginTop: spacing.l, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.m },
  cancel: { color: colors.muted, fontWeight: "600", paddingVertical: spacing.s, paddingHorizontal: spacing.m },
});