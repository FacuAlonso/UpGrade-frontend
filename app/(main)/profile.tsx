import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Alert, ScrollView } from "react-native";
import { Stack } from "expo-router";
import EditFieldModal from "../../components/editFieldModal";
import ChangePasswordModal from "../../components/changePasswordModal";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { useAuth } from "../../hooks/useAuth";
import PrimaryButton from "../../components/primaryButton";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setMode } from "../../redux/reducers/appModeSlice";

export default function ProfileScreen() {
  const { user, logout, fetchWithAuth, refreshMe } = useAuth();

  const [phone] = useState(user?.contactData ?? "");
  const [pwdOpen, setPwdOpen] = useState(false);

  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editLinkOpen, setEditLinkOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);

  const [address, setAddress] = useState(user?.classroomAddress ?? "");
  const [link, setLink] = useState(user?.onlineClassroomLink ?? "");
  const [contact, setContact] = useState(user?.contactData ?? "");

  const mode = useSelector((s: RootState) => s.appMode.mode);
  const dispatch = useDispatch();

  const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const email = user?.email ?? "";

  async function patchMe(payload: Partial<{
    classroomAddress: string | null;
    onlineClassroomLink: string | null;
    contactData: string | null;
  }>) {
    try {
      await fetchWithAuth("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await refreshMe(); 
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo guardar.");
      throw e;
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "Perfil" }} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name[0] ?? "U"}</Text>
        </View>
        <View>
          <Text style={styles.title}>{name || "Usuario"}</Text>
          <Text style={styles.subtitle}>{email}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Datos personales</Text>
      <View style={styles.card}>
        <Row label="Nombre" value={name} />
        <Row label="Email" value={email} />
        <Row label="Teléfono" value={phone}  />
      </View>

      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => setPwdOpen(true)}>
          <Text style={styles.rowLabel}>Cambiar contraseña</Text>
          <Text style={styles.rowAction}>Editar</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Modo tutor</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Activar modo tutor</Text>
          <Switch
            value={mode === "tutor"}
            onValueChange={(next) => { dispatch(setMode(next ? "tutor" : "student")); }}
            trackColor={{ false: "#D1D5DB", true: colors.primary }}
            thumbColor={"#fff"}
          />
        </View>
        {mode === "tutor" && (
          <Text style={styles.helper}>
            Modo tutor activo. Vas a ver opciones para gestionar perfil, agenda y tareas con alumnos.
          </Text>
        )}
      </View>

      {mode === "tutor" && (
        <>
          <Text style={styles.sectionTitle}>Datos de tutor</Text>
          <View style={styles.card}>
            <Row
              label="Dirección presencial"
              value={address || "—"}
              onPress={() => setEditAddressOpen(true)}
            />
            <Row
              label="Link de clase online"
              value={link || "—"}
              onPress={() => setEditLinkOpen(true)}
            />
            <Row
              label="Contacto (WhatsApp/Telegram)"
              value={contact || "—"}
              onPress={() => setEditContactOpen(true)}
            />
          </View>
        </>
      )}

      <PrimaryButton label="Cerrar sesión" onPress={logout} />

      <ChangePasswordModal
        visible={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSave={(payload) => console.log("Cambiar contraseña:", payload)}
      />

      <EditFieldModal
        visible={editAddressOpen}
        label="Dirección presencial"
        placeholder="Ej: San Martín 890, Córdoba"
        initialValue={address}
        onClose={() => setEditAddressOpen(false)}
        onSave={(val) => {
          setAddress(val);
          patchMe({ classroomAddress: val.length ? val : null });
        }}
      />
      <EditFieldModal
        visible={editLinkOpen}
        label="Link de clase online"
        placeholder="https://meet.google.com/..."
        initialValue={link}
        keyboardType="default"
        onClose={() => setEditLinkOpen(false)}
        onSave={(val) => {
          setLink(val);
          patchMe({ onlineClassroomLink: val.length ? val : null });
        }}
      />
      <EditFieldModal
        visible={editContactOpen}
        label="Contacto"
        placeholder="WhatsApp, Telegram, etc."
        initialValue={contact}
        onClose={() => setEditContactOpen(false)}
        onSave={(val) => {
          setContact(val);
          patchMe({ contactData: val.length ? val : null });
        }}
      />
    </ScrollView>
  );
}

function Row({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {onPress && <Text style={styles.rowAction}>Editar</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.l,
    marginBottom: spacing.xl,
    marginTop: spacing.xxl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: colors.text },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    marginBottom: spacing.l,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.m, gap: spacing.m },
  rowLabel: { fontSize: 16, fontWeight: "600", color: colors.text },
  rowValue: { color: colors.muted, marginTop: 2 },
  rowAction: { color: colors.primary, fontWeight: "700" },
  helper: { color: colors.muted, marginTop: spacing.m, marginBottom: spacing.s },
});
