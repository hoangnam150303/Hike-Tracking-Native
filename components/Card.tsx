import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CardProps = {
  id: string;
  title: string;
  length?: string;
  image?: any;
};

export default function Card({ id, title, length, image }: CardProps) {
  console.log("🖼 Image from DB:", image);

  const defaultImage = require("../assets/image_hikes/no_image.jpg");

  let source: any = defaultImage;

  if (typeof image === "number") {
    // asset nội bộ (require trả về số)
    source = image;
  } else if (typeof image === "string" && image.trim() !== "") {
    // ảnh từ thư viện hoặc URL
    source = { uri: image };
  } else if (typeof image === "object" && image.uri) {
    // ảnh nội bộ lưu dưới dạng { uri: "../assets/image_hikes/xxx" }
    const map: Record<string, any> = {
      "../assets/image_hikes/lake.jpg": require("../assets/image_hikes/lake.jpg"),
      "../assets/image_hikes/view1.jpg": require("../assets/image_hikes/view1.jpg"),
      "../assets/image_hikes/view2.jpg": require("../assets/image_hikes/view2.jpg"),
      "../assets/image_hikes/view3.jpg": require("../assets/image_hikes/view3.jpg"),
      "../assets/image_hikes/view4.jpg": require("../assets/image_hikes/view4.jpg"),
      "../assets/image_hikes/view5.webp": require("../assets/image_hikes/view5.webp"),
    };

    source = map[image.uri] || defaultImage;
  }

  return (
    <Link
      href={{
        pathname: "/hike-detail/[id]",
        params: { id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <Image source={source} style={styles.image} resizeMode="cover" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {length && <Text style={styles.length}>{length} km</Text>}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 120,
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  length: {
    fontSize: 14,
    color: "#666",
  },
});
