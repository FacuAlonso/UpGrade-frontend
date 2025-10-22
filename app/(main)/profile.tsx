import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { Stack } from "expo-router";
import EditFieldModal from "../../components/editFieldModal";
import ChangePasswordModal from "../../components/changePasswordModal";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

export default function ProfileScreen() {
  const [name, setName] = useState("Nombre Apellido");
  const [email, setEmail] = useState("usuario@correo.com");
  const [phone, setPhone] = useState("+54 11 1234-5678");

  const [isTutor, setIsTutor] = useState(false);

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Perfil" }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name[0]}</Text></View>
        <View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>{email}</Text>
        </View>
      </View>

      {/* Datos personales */}
      <Text style={styles.sectionTitle}>Datos personales</Text>
      <View style={styles.card}>
        <Row label="Nombre" value={name} onPress={() => setEditNameOpen(true)} />
        <Row label="Email" value={email} onPress={() => setEditEmailOpen(true)} />
        <Row label="Teléfono" value={phone} onPress={() => setEditPhoneOpen(true)} />
      </View>

      {/* Seguridad */}
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => setPwdOpen(true)}>
          <Text style={styles.rowLabel}>Cambiar contraseña</Text>
          <Text style={styles.rowAction}>Editar</Text>
        </Pressable>
      </View>

      {/* Modo tutor */}
      <Text style={styles.sectionTitle}>Modo tutor</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Activar modo tutor</Text>
          <Switch
            value={isTutor}
            onValueChange={setIsTutor}
            trackColor={{ false: "#D1D5DB", true: colors.primary }}
            thumbColor={"#fff"}
          />
        </View>
        {isTutor && (
          <Text style={styles.helper}>
            Modo tutor activo. Vas a ver opciones para gestionar perfil, agenda y tareas con alumnos.
          </Text>
        )}
      </View>

      {/* (Opcional) Acciones extra */}
      {/* <PrimaryButton label="Cerrar sesión" onPress={() => console.log("logout")} /> */}

      {/* Modals */}
      <EditFieldModal
        visible={editNameOpen}
        label="Editar nombre"
        placeholder="Nombre y Apellido"
        initialValue={name}
        onClose={() => setEditNameOpen(false)}
        onSave={setName}
      />
      <EditFieldModal
        visible={editEmailOpen}
        label="Editar email"
        placeholder="usuario@correo.com"
        initialValue={email}
        keyboardType="email-address"
        onClose={() => setEditEmailOpen(false)}
        onSave={setEmail}
      />
      <EditFieldModal
        visible={editPhoneOpen}
        label="Editar teléfono"
        placeholder="+54 11..."
        initialValue={phone}
        keyboardType="phone-pad"
        onClose={() => setEditPhoneOpen(false)}
        onSave={setPhone}
      />
      <ChangePasswordModal
        visible={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSave={(payload) => console.log("Cambiar contraseña:", payload)}
      />
    </View>
  );
}

/** Row simple reutilizable */
function Row({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <Text style={styles.rowAction}>Editar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background, justifyContent:'center' },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.l, marginBottom: spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "700", color: colors.text },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.muted, marginBottom: spacing.s, marginTop: spacing.m },
  card: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: spacing.l, paddingVertical: spacing.s, marginBottom: spacing.l },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.m, gap: spacing.m },
  rowLabel: { fontSize: 16, fontWeight: "600", color: colors.text },
  rowValue: { color: colors.muted, marginTop: 2 },
  rowAction: { color: colors.primary, fontWeight: "700" },

  helper: { color: colors.muted, marginTop: spacing.m, marginBottom: spacing.s },
});