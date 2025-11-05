import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import PrimaryButton from "./primaryButton";
import { Lesson } from "../hooks/data";
import { formatDateTimeISO } from "../utils/formatDate";
import { useAuth } from "../hooks/useAuth";

type Props = {
  lesson: Lesson | null;
  open: boolean;
  onClose: () => void;
  onCancelled?: () => void;
  onRefresh?: () => void;
};

export default function ClassDetailsModal({
  lesson,
  open,
  onClose,
  onCancelled,
  onRefresh,
}: Props) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, fadeAnim, slideAnim]);

  if (!lesson) return null;

  const subject = lesson.subject?.name ?? "Materia";
  const tutor = `${lesson.tutor?.firstName ?? ""} ${lesson.tutor?.lastName ?? ""}`.trim();
  const when = formatDateTimeISO(lesson.timestamp);

  const date = new Date(lesson.timestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const isSoon = diffHours <= 24 && diffHours > 0;

  const handleCancel = async () => {
    Alert.alert(
      "Cancelar clase",
      "¿Estás seguro de que querés cancelar esta clase?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await fetchWithAuth(`/lessons/cancel`, {
                method: "POST",
                body: JSON.stringify({ lessonId: lesson.id }),
              });
              onCancelled?.();
              onRefresh?.();
              onClose();
            } catch (err) {
              console.error("Error al cancelar clase:", err);
              Alert.alert("Error", "No se pudo cancelar la clase. Intentá nuevamente.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const contact: string[] = [
    lesson.tutor?.email && `📧 ${lesson.tutor.email}`,
    lesson.tutor?.contactData && `📱 ${lesson.tutor.contactData}`,
    lesson.tutor?.classroomAddress && `📍 ${lesson.tutor.classroomAddress}`,
    lesson.tutor?.onlineClassroomLink && `🌐 ${lesson.tutor.onlineClassroomLink}`,
  ].filter(Boolean) as string[];

  return (
    <Modal transparent visible={open} onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{subject}</Text>
        <Text style={styles.subtitle}>Profesor: {tutor}</Text>
        <Text style={styles.text}>
          Modalidad: {lesson.modality === "ONLINE" ? "Virtual" : "Presencial"}
        </Text>
        <Text style={styles.text}>Fecha y hora: {when}</Text>

        {isSoon && (
          <Text style={styles.warning}>
            ⏰ Faltan {Math.floor(diffHours)}h {Math.floor((diffHours % 1) * 60)}m para la clase
          </Text>
        )}

        {contact.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.m }]}>Contacto</Text>
            {contact.map((c, i) => {
              const isLink = c.includes("🌐");
              const icon =
                c.includes("📧")
                  ? "mail-outline"
                  : c.includes("📱")
                  ? "call-outline"
                  : c.includes("📍")
                  ? "location-outline"
                  : "link-outline";
              const text = c.slice(2).trim();

              return (
                <Pressable
                  key={i}
                  style={styles.contactRow}
                  onPress={() => {
                    if (isLink && lesson.tutor?.onlineClassroomLink) {
                      Linking.openURL(lesson.tutor.onlineClassroomLink);
                    }
                  }}
                >
                  <Ionicons
                    name={icon as any}
                    size={18}
                    color={isLink ? colors.primary : colors.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.link, isLink && { color: colors.primary }]}>{text}</Text>
                </Pressable>
              );
            })}
          </>
        )}

        <View style={{ height: spacing.l }} />

        <PrimaryButton
          label={loading ? "Cancelando..." : "Cancelar clase"}
          onPress={handleCancel}
          style={styles.cancelBtn}
          textStyle={{ color: "white" }}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    gap: spacing.s,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 16, color: colors.text },
  text: { fontSize: 14, color: colors.muted },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.muted,
    marginTop: spacing.s,
  },
  warning: { color: "#DC2626", fontWeight: "700", marginTop: spacing.s },
  contactRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  link: { color: colors.text },
  cancelBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.l,
  },
});
