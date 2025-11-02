import * as ImagePicker from "expo-image-picker";
// 1. Thêm import
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
// 2. Import các hàm database
import Toast from "react-native-toast-message";
import {
    getHikeById,
    getObservationsByHike,
    insertObservation,
    updateHike,
} from "../../utils/dbhelper"; // 

export default function HikeEditScreen() {
    // 3. Lấy router và id từ trang trước
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Lấy id từ route (ví dụ: /edit/5)
    const [currentHikeId, setCurrentHikeId] = useState<number | null>(null);

    // --- States cho form ---
    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [parking, setParking] = useState("");
    const [length, setLength] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [weather, setWeather] = useState("");
    const [companions, setCompanions] = useState("");
    const [description, setDescription] = useState("");

    // --- States cho observation ---
    const [observationText, setObservationText] = useState("");
    const [comment, setComment] = useState("");
    const [observationsList, setObservationsList] = useState<any[]>([]); // State để hiển thị list observations

    // 4. Thêm useEffect để load dữ liệu khi mở màn hình
    useEffect(() => {
        console.log(id)
        if (!id) {
            Alert.alert("Lỗi", "Không có ID của hike", [
                { text: "OK", onPress: () => router.back() },
            ]);
            return;
        }

        const hikeIdNumber = parseInt(id as string, 10);
        if (isNaN(hikeIdNumber)) {
            Alert.alert("Lỗi", "ID của hike không hợp lệ", [
                { text: "OK", onPress: () => router.back() },
            ]);
            return;
        }

        setCurrentHikeId(hikeIdNumber); // Lưu lại ID hiện tại

        const loadData = async () => {
            // 1. Lấy thông tin chi tiết của hike
            const hikeData = await getHikeById(hikeIdNumber);
            if (hikeData) {
                setTitle(hikeData.hike_name);
                setLocation(hikeData.location);
                setDate(hikeData.date); // Giả sử date là string
                setParking(hikeData.parking);
                setLength(hikeData.length.toString()); // Chuyển number về string
                setDifficulty(hikeData.difficulty);
                setWeather(hikeData.weather || "");
                setCompanions(hikeData.companions || "");
                setDescription(hikeData.description || "");
                setImage(hikeData.photo_uri || null);
            }

            // 2. Lấy danh sách observations của hike đó
            // (Bạn đã có hàm getObservationsByHike)
            const observationsData = await getObservationsByHike(hikeIdNumber);
            setObservationsList(observationsData);
        };

        loadData();
    }, [id]); // Effect này sẽ chạy lại nếu id thay đổi

    // --- pick image from gallery ---
    const handlePickImage = async () => {
        // Thêm kiểm tra quyền
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Cần quyền", "Xin hãy cấp quyền truy cập thư viện ảnh");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true, // Cho phép sửa
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // 5. Cập nhật hàm handleUpdateHike
    const handleUpdateHike = async () => {
        if (!currentHikeId) return;

        // Validate length
        const numericLength = parseFloat(length);
        if (isNaN(numericLength)) {
            Toast.show({ type: "error", text1: "Invalid input", text2: "Length phải là số" });
            return;
        }

        const success = await updateHike(
            currentHikeId,
            title,
            location,
            date,
            parking,
            numericLength,
            difficulty,
            description,
            weather,
            companions,
            image || "" // Gửi ảnh mới hoặc ảnh cũ
        );

        if (success) {
            // updateHike đã tự show Toast
            router.back(); // Quay về trang trước
        }
    };

    // 6. Cập nhật hàm handleAddObservation
    const handleAddObservation = async () => {
        if (!currentHikeId) return;
        if (observationText.trim() === "") {
            Toast.show({ type: "error", text1: "Thiếu", text2: "Observation không được rỗng" });
            return;
        }

        const success = await insertObservation(
            currentHikeId,
            observationText.trim(),
            new Date().toISOString(), // Lấy thời gian hiện tại
            comment.trim() || ""
        );

        if (success) {
            // Tải lại danh sách observation
            const observationsData = await getObservationsByHike(currentHikeId);
            setObservationsList(observationsData);
            // Xóa form
            setObservationText("");
            setComment("");
        }
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* --- IMAGE --- */}
            <Image
                source={image ? { uri: image } : require("../../assets/hero1.jpg")} // ❗ Sửa lại đường dẫn ảnh default
                style={styles.hikeImage}
                resizeMode="cover"
            />
            <TouchableOpacity style={styles.changeButton} onPress={handlePickImage}>
                <Text style={styles.changeButtonText}>Change Image</Text>
            </TouchableOpacity>

            {/* --- FORM FIELDS --- */}
            <TextInput
                style={styles.input}
                placeholder="Hike Name"
                value={title}
                onChangeText={setTitle}
            />
            {/* ... các TextInput khác ... */}
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
            <TextInput style={styles.input} placeholder="Date" value={date} onChangeText={setDate} />
            <TextInput style={styles.input} placeholder="Parking" value={parking} onChangeText={setParking} />
            <TextInput style={styles.input} placeholder="Length (km)" value={length} onChangeText={setLength} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} />
            <TextInput style={styles.input} placeholder="Weather" value={weather} onChangeText={setWeather} />
            <TextInput style={styles.input} placeholder="Companions" value={companions} onChangeText={setCompanions} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline value={description} onChangeText={setDescription} />

            <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateHike}
            >
                <Text style={styles.buttonText}>Update Hike</Text>
            </TouchableOpacity>

            {/* --- OBSERVATION SECTION --- */}
            <Text style={styles.sectionTitle}>Observations</Text>
            {/* 7. Hiển thị danh sách observations đã tải */}
            <View style={styles.obsListContainer}>
                {observationsList.length === 0 ? (
                    <Text style={styles.obsItemText}>No observations yet.</Text>
                ) : (
                    observationsList.map((obs) => (
                        <View key={obs.observation_id} style={styles.obsItem}>
                            <Text style={styles.obsItemText}>- {obs.observation}</Text>
                            {obs.comment && <Text style={styles.obsComment}> ({obs.comment})</Text>}
                        </View>
                    ))
                )}
            </View>

            <Text style={styles.sectionTitle}>Add New Observation</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observation details"
                multiline
                value={observationText} // Đổi tên state
                onChangeText={setObservationText}
            />
            <TextInput
                style={styles.input}
                placeholder="Comment (optional)"
                value={comment}
                onChangeText={setComment}
            />
            <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddObservation}
            >
                <Text style={styles.buttonText}>Add Observation</Text>
            </TouchableOpacity>
            <Toast />
        </ScrollView>
    );
}

// 8. Thêm styles cho danh sách observation
const styles = StyleSheet.create({
    // ... (tất cả styles cũ của bạn) ...
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        padding: 20,
    },
    hikeImage: {
        width: "100%",
        height: 200,
        backgroundColor: "#ccc",
        borderRadius: 8,
    },
    changeButton: {
        alignSelf: "flex-start",
        marginTop: 8,
        backgroundColor: "#000",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    changeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginTop: 10,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    button: {
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 16,
    },
    updateButton: {
        backgroundColor: "#2196F3",
    },
    addButton: {
        backgroundColor: "#2E7D32",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginTop: 24,
        marginBottom: 8, // Thêm margin
    },
    // --- Styles mới ---
    obsListContainer: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
    },
    obsItem: {
        flexDirection: "row",
        paddingVertical: 4,
    },
    obsItemText: {
        fontSize: 15,
    },
    obsComment: {
        fontSize: 15,
        fontStyle: "italic",
        color: "#555",
        marginLeft: 4,
    },
});