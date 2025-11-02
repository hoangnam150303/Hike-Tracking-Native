import { Link, useRouter } from "expo-router"; // 1. Import useRouter
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useUser } from "../context/UserContext";
import { login } from "../utils/dbhelper";
export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter(); // 3. Khởi tạo router
    const { setUser } = useUser();
    // 4. Cập nhật handleLogin
    const handleLogin = async () => {
        // Kiểm tra đầu vào đơn giản
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        try {
            // Gọi hàm login từ dbhelper
            const userData = await login(email, password);

            if (userData) {
                // Hàm login đã tự hiển thị Toast
                // 5. Điều hướng đến trang chủ sau khi login thành công
                // Dùng 'replace' để người dùng không thể "back" về trang 
                setUser(userData);
                router.replace("/"); // Giả sử 'all-hikes' là trang chủ của bạn
            }
            // Nếu 'success' là false, hàm login trong dbhelper đã tự hiển thị Toast lỗi
        } catch (error) {
            console.error("Login component error:", error);
            Alert.alert("Error", "An unexpected error occurred during login.");
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.card}>
                {/* --- Title --- */}
                <Text style={styles.title}>Login</Text>

                {/* --- Email Input --- */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none" // Thêm vào để tắt tự động viết hoa
                    value={email}
                    onChangeText={setEmail}
                />

                {/* --- Password Input --- */}
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {/* --- Login Button --- */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                {/* --- Register Link --- */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        You don't have an account?{" "}
                        <Link href="/register" style={styles.link}>
                            Register
                        </Link>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    card: {
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 40,
    },
    input: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        color: "#000",
        marginBottom: 16,
        elevation: 2, // nhẹ nhàng để giống shadow trên ảnh
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    loginButton: {
        width: "100%",
        backgroundColor: "#000",
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 25,
    },
    loginText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    registerContainer: {
        alignItems: "center",
    },
    registerText: {
        fontSize: 14,
        color: "#000",
        fontWeight: "bold",
    },
    link: {
        color: "#007bff",
    },
});