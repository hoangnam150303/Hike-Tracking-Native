import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { UserProvider } from "../context/UserContext"; // <-- Kiểm tra tên file này
// --- Imports Thêm vào ---
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { initDB } from "../utils/dbhelper"; // <-- Kiểm tra lại đường dẫn này!

export default function RootLayout() {
  // 1. Thêm state để theo dõi DB đã sẵn sàng chưa
  const [dbReady, setDbReady] = useState(false);

  // 2. Sử dụng useEffect để khởi tạo DB khi ứng dụng mở
  useEffect(() => {
    async function initializeDatabase() {
      try {
        console.log("🚀 Initializing database...");
        await initDB(); // Chờ cho đến khi initDB() thực sự chạy xong
        console.log("✅ Database initialized successfully!");
        setDbReady(true); // Đánh dấu là DB đã sẵn sàng
      } catch (e) {
        console.error("❌ Failed to initialize database", e);
        Toast.show({
          type: "error",
          text1: "Database Error",
          text2: "Failed to initialize app.",
        });
      }
    }

    initializeDatabase();
  }, []); // Mảng rỗng [] đảm bảo nó chỉ chạy MỘT LẦN

  // 3. Provider phải bọc MỌI THỨ
  // Logic loading sẽ nằm BÊN TRONG provider
  return (
    <UserProvider>
      {!dbReady ? (
        // TRẠNG THÁI LOADING (DB CHƯA SẴN SÀNG)
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text>Loading database...</Text>
        </View>
      ) : (
        // TRẠNG THÁI APP CHÍNH (DB ĐÃ SẴN SÀNG)
        <>
          {/* Stack quản lý navigation */}
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

          {/* Toast nằm ngoài Stack để overlay toàn màn hình */}
          <Toast />
        </>
      )}
    </UserProvider>
  );
}