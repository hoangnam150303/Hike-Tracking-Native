import { Link } from "expo-router";
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

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        Alert.alert("Login", `Email: ${email}\nPassword: ${password}`);
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
