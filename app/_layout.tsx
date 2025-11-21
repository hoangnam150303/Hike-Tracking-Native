import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { UserProvider } from "../context/UserContext"; 
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { initDB } from "../utils/dbhelper"; 

export default function RootLayout() {
  // state use for following database is already initialized
  const [dbReady, setDbReady] = useState(false);

  // use effect to check if database is already initialized
  useEffect(() => {
    async function initializeDatabase() {
      try {
        console.log("Initializing database...");
        await initDB();
        console.log("✅ Database initialized successfully!");
        setDbReady(true);
      } catch (e) {
        console.error("Failed to initialize database", e);
        Toast.show({
          type: "error",
          text1: "Database Error",
          text2: "Failed to initialize app.",
        });
      }
    }

    initializeDatabase();
  }, []); // Empty dependency array means this effect runs once


  // Logic loading will be here
  return (
    <UserProvider>
      {!dbReady ? ( // if database is not already, it will display loading
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text>Loading database...</Text>
        </View>
      ) : ( // if database is already, it will display app
        <>
          {/* Stack manager for navigation */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="all-user-hikes" />
            <Stack.Screen name="create-page" />
            <Stack.Screen name="all-hikes" />
            <Stack.Screen name="hike-detail/[id]" />
            <Stack.Screen name="hike-update/[id]" />
          </Stack>

          {/* Toast message */}
          <Toast />
        </>
      )}
    </UserProvider>
  );
}