import React, { useEffect, useMemo } from "react";
import { Animated, Easing, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onFinish?: () => void;
};

export default function ConfirmationAnimation({ visible, onFinish }: Props) {
  const scale = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
          }).start(() => {
            scale.setValue(0);
            if (onFinish) onFinish();
          });
        }, 1000);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Ionicons name="checkmark" size={60} color="white" />
        <Text style={styles.text}>¡Reserva confirmada!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  container: {
    backgroundColor: "#00C26D",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
});
