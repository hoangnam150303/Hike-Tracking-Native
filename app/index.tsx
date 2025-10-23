import { Link } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
const { width } = Dimensions.get("window");

export default function Index() {
  const images = [
    require("../assets/hero1.jpg"),
    require("../assets/hero2.jpg"),
    require("../assets/hero3.jpg"),
    require("../assets/hero4.jpg"),
  ];

  return (
    <ScrollView style={styles.container}>

      <View style={styles.heroCard}>

        <Carousel
          width={width}
          height={400}
          autoPlay
          autoPlayInterval={2500}
          loop
          data={images}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <Image source={item} style={styles.heroImage} resizeMode="cover" />
          )}
        />


        <View style={styles.header}>
          <Image
            source={require("../assets/map_marker.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Link href="/login" style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </Link>
        </View>


        <View style={styles.centerContent}>
          <Text style={styles.heroText}>Take a hike,{"\n"}find yourself</Text>

          <Link href="/create-page" style={styles.ctaButton}>
            <Text style={styles.ctaText}>Check In Now!</Text>
          </Link>
        </View>
      </View>


      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Hike</Text>

        <Link href="/all-hikes">
          <Text style={styles.seeMore}>See More</Text></Link>

      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.cardText}>Hike {item}</Text>
          </View>
        ))}
      </ScrollView>


      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Hikes</Text>
        <TouchableOpacity>
          <Text style={styles.seeMore}>See More</Text>
        </TouchableOpacity>
      </View>


      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {[4, 5, 6].map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.cardText}>Hike {item}</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heroCard: {
    width: "100%",
    height: 400,
    backgroundColor: "#2e7d32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  heroImage: {
    width: "100%",
    height: 400,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  loginButton: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  loginText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  centerContent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  heroText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  ctaText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  seeMore: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  horizontalScroll: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  card: {
    width: 160,
    height: 180,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: "#555",
    fontWeight: "600",
  },
});
