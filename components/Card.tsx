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
  return (
    <Link
      href={{
        pathname: "/hike-detail/[id]",
        params: { id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        {image && <Image source={image} style={styles.image} resizeMode="cover" />}
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
