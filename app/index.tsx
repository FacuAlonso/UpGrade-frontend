import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import PrimaryButton from "../components/primaryButton";
import SecondaryButton from "../components/secondaryButton";

const SPACING = { s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

export default function Landing() {
  return (
    <ImageBackground
      source={require("../assets/images/LandingBackgroundGradient.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View style={styles.centerBlock}>
          <Image
            source={require("../assets/images/FulLogoHorizontal.png")}
            style={styles.logo}
            resizeMode="contain"
          />
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "80%",
    height: undefined,
    aspectRatio: 1, 
  },
  buttons: {
    gap: SPACING.m,
    marginBottom: 100, 
  },
});
