import Card from "@/components/Card";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { useUser } from "../context/UserContext";
import { getAllHikes, getUserHikes } from "../utils/dbhelper"; // 🔗 lấy từ db

const { width } = Dimensions.get("window");

export default function Index() {
  const images = [
    require("../assets/hero1.jpg"),
    require("../assets/hero2.jpg"),
    require("../assets/hero3.jpg"),
    require("../assets/hero4.jpg"),
  ];

  const { user, setUser } = useUser();
  const [userHikes, setUserHikes] = useState<any[]>([]);
  const [allHikes, setAllHikes] = useState<any[]>([]);

  const handleLogout = () => setUser(null);

  
  useFocusEffect(
  React.useCallback(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const myHikes = await getUserHikes(user.user_id);
          setUserHikes(myHikes);
        } else {
          setUserHikes([]);
        }

        const hikes = await getAllHikes();
        setAllHikes(hikes);
      } catch (err) {
        console.error("Fetch hikes error:", err);
      }
    };

    fetchData();
  }, [user])
); 

  return (
    <ScrollView style={styles.container}>
      {/* --- HERO --- */}
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
          {user ? (
            <View style={styles.loggedInContainer}>
              <TouchableOpacity onPress={handleLogout} style={styles.loginButton}>
                <Text style={styles.loginText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Link href="/login" style={styles.loginButton}>
              <Text style={styles.loginText}>Login</Text>
            </Link>
          )}
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.heroText}>
            {user
              ? `Hello, ${user.username}!👋`
              : "Take a hike,\nfind yourself"}
          </Text>

          <Link href="/create-page" style={styles.ctaButton}>
            <Text style={styles.ctaText}>Check In Now!</Text>
          </Link>
        </View>
      </View>

      {/* --- YOUR HIKES --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Hike</Text>
        <Link href="/all-user-hikes">
          <Text style={styles.seeMore}>See More</Text>
        </Link>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {userHikes.length > 0 ? (
          userHikes.map((hike) => (
            <View key={hike.hike_id} style={{ marginRight: 10 }}>
              <Card
                id={hike.hike_id.toString()}
                title={hike.hike_name}
                length={hike.length.toString()}
                image={
                  hike.photo_uri
                    ? { uri: hike.photo_uri }
                    : images[hike.hike_id % images.length]
                }
              />
            </View>
          ))
        ) : (
          <Text style={{ paddingHorizontal: 20, color: "#555" }}>
            {user ? "You have no hikes yet." : "Login to view your hikes."}
          </Text>
        )}
      </ScrollView>

      {/* --- ALL HIKES --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Hikes</Text>
        <Link href="/all-hikes">
          <Text style={styles.seeMore}>See More</Text>
        </Link>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {allHikes.length > 0 ? (
          allHikes.map((hike) => (
            <View key={hike.hike_id} style={{ marginRight: 10 }}>
              <Card
                id={hike.hike_id.toString()}
                title={hike.hike_name}
                length={hike.length.toString()}
                image={
                  hike.photo_uri
                    ? { uri: hike.photo_uri }
                    : images[hike.hike_id % images.length]
                }
              />
            </View>
          ))
        ) : (
          <Text style={{ paddingHorizontal: 20, color: "#555" }}>
            No hikes available yet.
          </Text>
        )}
      </ScrollView>
    </ScrollView>
  );
}

// --- STYLE ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { width: 40, height: 40 },
  loginButton: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  loginText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  loggedInContainer: { alignItems: "flex-end" },
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
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  ctaText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: { color: "#000", fontSize: 20, fontWeight: "bold" },
  seeMore: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  horizontalScroll: { marginTop: 10, paddingHorizontal: 16 },
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
  heroImage: { width: "100%", height: 400 },
});
