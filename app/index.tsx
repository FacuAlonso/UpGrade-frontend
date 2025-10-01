import React from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import PrimaryButton from "../components/primaryButton";
import SecondaryButton from "../components/secondaryButton";

const SPACING = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

export default function Landing() {
  return (
    <ImageBackground
      source={require("../assets/images/LandingBackgroundGradient.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image source={require("../assets/images/isotipoUpGrade.jpg")} style={styles.logo} />
          <View>
            <Text style={styles.brand}>UpGrade</Text>
            <Text style={styles.tagline}>APRENDÉ SIN LÍMITES</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Link href="/login" asChild>
            <PrimaryButton label="Iniciar sesión" />
          </Link>

          <Link href="/register" asChild>
            <SecondaryButton label="Crear una cuenta" />
          </Link>
        </View>
        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logo: { width: 56, height: 56, marginRight: SPACING.m, borderRadius: 12 },
  brand: { color: "#FFFFFF", fontSize: 32, fontWeight: "800", lineHeight: 36 },
  tagline: { color: "#CFE6FF", fontSize: 12, letterSpacing: 1.2, marginTop: 2 },
  buttons: { marginTop: SPACING.xl, gap: SPACING.m },
});
