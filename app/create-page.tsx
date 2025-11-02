import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useUser } from "../context/UserContext";
import { insertHike } from "../utils/dbhelper"; // 🔗 import từ file bạn có sẵn
export default function CreateHikeScreen() {
    const router = useRouter();

    const [hikeName, setHikeName] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [parking, setParking] = useState<"Yes" | "No" | null>(null);
    const [length, setLength] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [description, setDescription] = useState("");
    const [weather, setWeather] = useState("");
    const [companions, setCompanions] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const { user, setUser } = useUser();
    const user_id = user?.user_id;
    // 🗓 Pick Date
    const handlePickDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    // 🖼 Pick Photo
    const handlePickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) setPhoto(result.assets[0].uri);
    };

    // submit
    const handleSubmit = async () => {
        // 1. Kiểm tra các field bắt buộc
        if (!hikeName || !location || !date || !parking || !length || !difficulty) {
            Toast.show({
                type: "error",
                text1: "Missing Information",
                text2: "Please fill in all required fields (*)",
            });
            return;
        }

        // --- 2. Thêm bước kiểm tra "Length" là số hợp lệ ---
        const numericLength = parseFloat(length);
        if (isNaN(numericLength)) {
            Toast.show({
                type: "error",
                text1: "Invalid Input",
                text2: "Length of Hike must be a valid number (e.g. 5.2).",
            });
            return; // Dừng lại nếu length không phải là số
        }
        // ----------------------------------------------------

        // 3. Lấy user_id (Cách của bạn đã đúng)
        // Nếu user không đăng nhập (user_id là undefined), nó sẽ dùng 0.
        const currentUserId = user_id || 0;
        if (!user_id) {
            console.warn("User not logged in. Saving hike with user_id 0.");
        }

        // 4. Gọi insertHike với dữ liệu sạch
        const success = await insertHike(
            hikeName.trim(),
            location.trim(),
            date.toISOString(),
            parking,
            numericLength, // <-- Dùng biến đã được validate
            difficulty,
            description?.trim() || "",
            weather || "",
            companions || "",
            photo || "",
            currentUserId // <-- Dùng biến đã được gán
        );

        if (success) {
            Alert.alert("✅ Success", "Your hike record has been saved!");
            // Reset form
            setHikeName("");
            setLocation("");
            setDate(null);
            setParking(null);
            setLength("");
            setDifficulty("");
            setDescription("");
            setWeather("");
            setCompanions("");
            setPhoto(null);

            router.push("/"); // quay lại home
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Create Hike Record</Text>

            {/* Hike Name */}
            <Text style={styles.label}>Name of Hike *</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter hike name (e.g. Snowdon, Trosley Park)"
                value={hikeName}
                onChangeText={setHikeName}
            />

            {/* Location */}
            <Text style={styles.label}>Location *</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter location name"
                value={location}
                onChangeText={setLocation}
            />

            {/* Date */}
            <Text style={styles.label}>Date of Hike *</Text>
            <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                    {date ? date.toLocaleDateString() : "Not selected"}
                </Text>
                <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.smallButtonText}>Pick Date</Text>
                </TouchableOpacity>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display="default"
                    themeVariant="dark"
                    onChange={handlePickDate}
                />
            )}

            {/* Parking */}
            <Text style={styles.label}>Parking Available *</Text>
            <View style={styles.radioGroup}>
                {["Yes", "No"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() => setParking(option as "Yes" | "No")}
                    >
                        <View
                            style={[
                                styles.radioCircle,
                                parking === option && styles.radioSelected,
                            ]}
                        />
                        <Text style={styles.radioLabel}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Length */}
            <Text style={styles.label}>Length of Hike (km) *</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter length (e.g. 5.2)"
                keyboardType="numeric"
                value={length}
                onChangeText={setLength}
            />

            {/* Difficulty */}
            <Text style={styles.label}>Level of Difficulty *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={difficulty}
                    onValueChange={(itemValue) => setDifficulty(itemValue)}
                >
                    <Picker.Item label="Select difficulty" value="" />
                    <Picker.Item label="Easy" value="Easy" />
                    <Picker.Item label="Moderate" value="Moderate" />
                    <Picker.Item label="Hard" value="Hard" />
                </Picker>
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                multiline
                placeholder="Write something about your hike..."
                value={description}
                onChangeText={setDescription}
            />

            {/* Weather */}
            <Text style={styles.label}>Weather Condition</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={weather}
                    onValueChange={(itemValue) => setWeather(itemValue)}
                >
                    <Picker.Item label="Select weather" value="" />
                    <Picker.Item label="Sunny" value="Sunny" />
                    <Picker.Item label="Cloudy" value="Cloudy" />
                    <Picker.Item label="Rainy" value="Rainy" />
                </Picker>
            </View>

            {/* Companions */}
            <Text style={styles.label}>Who did you hike with?</Text>
            <TextInput
                style={styles.input}
                placeholder="E.g. Alone, friends, family..."
                value={companions}
                onChangeText={setCompanions}
            />

            {/* Photo */}
            <Text style={styles.label}>Check-in Photo</Text>
            {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
                <View style={[styles.photo, { backgroundColor: "#ccc" }]} />
            )}
            <TouchableOpacity style={styles.smallButton} onPress={handlePickPhoto}>
                <Text style={styles.smallButtonText}>Choose Photo</Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit Hike Record</Text>
            </TouchableOpacity>

            {/* Back */}
            <Link href="/" style={styles.backText}>
                Back To Home Page
            </Link>

            <Toast />
        </ScrollView>
    );
}

// === STYLE ===
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 24 },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 6,
        color: "#000",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        padding: 10,
        fontSize: 15,
        color: "#000",
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dateText: { color: "#666", padding: 10, flex: 1 },
    smallButton: {
        backgroundColor: "#000",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: "center",
    },
    smallButtonText: { color: "#fff", fontWeight: "bold" },
    radioGroup: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 24,
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#000",
        marginRight: 8,
    },
    radioSelected: { backgroundColor: "#000" },
    radioLabel: { color: "#000" },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
    },
    photo: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: "#000",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 30,
    },
    submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    backText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "right",
        marginTop: 16,
    },
});
