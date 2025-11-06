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
import Toast from "react-native-toast-message";
import {
    getHikeById,
    getObservationsByHike,
    insertObservation,
    updateHike,
} from "../../utils/dbhelper";

// === Danh sách ảnh nội bộ ===
const imageOptions = [
    { label: "Lake", uri: "../assets/image_hikes/lake.jpg", source: require("../../assets/image_hikes/lake.jpg") },
    { label: "View 1", uri: "../assets/image_hikes/view1.jpg", source: require("../../assets/image_hikes/view1.jpg") },
    { label: "View 2", uri: "../assets/image_hikes/view2.jpg", source: require("../../assets/image_hikes/view2.jpg") },
    { label: "View 3", uri: "../assets/image_hikes/view3.jpg", source: require("../../assets/image_hikes/view3.jpg") },
    { label: "View 4", uri: "../assets/image_hikes/view4.jpg", source: require("../../assets/image_hikes/view4.jpg") },
    { label: "View 5", uri: "../assets/image_hikes/view5.webp", source: require("../../assets/image_hikes/view5.webp") },
];

// === Helper chọn ảnh an toàn ===
const getImageSource = (img: any) => {
    const defaultImg = require("../../assets/image_hikes/no_image.jpg");
    if (!img) return defaultImg;
    if (typeof img === "object" && img.source) return img.source;
    if (typeof img === "string" && img.trim() !== "") return { uri: img };
    return defaultImg;
};

export default function HikeEditScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [currentHikeId, setCurrentHikeId] = useState<number | null>(null);

    // --- Form states ---
    const [image, setImage] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [parking, setParking] = useState("");
    const [length, setLength] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [weather, setWeather] = useState("");
    const [companions, setCompanions] = useState("");
    const [description, setDescription] = useState("");

    // --- Observation states ---
    const [observationText, setObservationText] = useState("");
    const [comment, setComment] = useState("");
    const [observationsList, setObservationsList] = useState<any[]>([]);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // === Load dữ liệu hike ===
    useEffect(() => {
        if (!id) {
            Alert.alert("Error", "No Hike ID found", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }
        const hikeIdNumber = parseInt(id as string, 10);
        if (isNaN(hikeIdNumber)) {
            Alert.alert("Error", "Invalid hike ID", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

        setCurrentHikeId(hikeIdNumber);

        const loadData = async () => {
            const hikeData = await getHikeById(hikeIdNumber);
            if (hikeData) {
                setTitle(hikeData.hike_name);
                setLocation(hikeData.location);
                setDate(hikeData.date);
                setParking(hikeData.parking);
                setLength(hikeData.length.toString());
                setDifficulty(hikeData.difficulty);
                setWeather(hikeData.weather || "");
                setCompanions(hikeData.companions || "");
                setDescription(hikeData.description || "");

                // ✅ Nếu ảnh là object {uri: "..."} → chọn ảnh tương ứng trong list
                if (typeof hikeData.photo_uri === "object" && hikeData.photo_uri.uri) {
                    const found = imageOptions.find((i) => i.uri === hikeData.photo_uri.uri);
                    setImage(found || null);
                } else if (typeof hikeData.photo_uri === "string") {
                    const found = imageOptions.find((i) => i.uri === hikeData.photo_uri);
                    setImage(found || null);
                } else {
                    setImage(null);
                }
            }

            const obsData = await getObservationsByHike(hikeIdNumber);
            setObservationsList(obsData);
        };

        loadData();
    }, [id]);

    // === Cập nhật hike ===
    const handleUpdateHike = async () => {
        if (!currentHikeId) return;

        const numericLength = parseFloat(length);
        if (isNaN(numericLength)) {
            Toast.show({ type: "error", text1: "Invalid input", text2: "Length must be a number" });
            return;
        }

        const photoPath =
            image && typeof image === "object" && image.uri
                ? image.uri
                : typeof image === "string"
                    ? image
                    : "";

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
            photoPath
        );

        if (success) {
            Toast.show({ type: "success", text1: "Hike updated successfully!" });
            router.back();
        }
    };

    // === Thêm observation mới ===
    const handleAddObservation = async () => {
        if (!currentHikeId) return;
        if (observationText.trim() === "") {
            Toast.show({ type: "error", text1: "Missing", text2: "Observation cannot be empty" });
            return;
        }

        const success = await insertObservation(
            currentHikeId,
            observationText.trim(),
            new Date().toISOString(),
            comment.trim() || ""
        );
        if (success) {
            const obsData = await getObservationsByHike(currentHikeId);
            setObservationsList(obsData);
            setObservationText("");
            setComment("");
        }
    };

    // === Chọn ảnh ===
    const handleSelectImage = (option: any) => {
        setImage(option);
        setShowImagePicker(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* === IMAGE PREVIEW === */}
            <Image source={getImageSource(image)} style={styles.hikeImage} resizeMode="cover" />

            <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setShowImagePicker(!showImagePicker)}
            >
                <Text style={styles.changeButtonText}>Change Image</Text>
            </TouchableOpacity>

            {/* === IMAGE PICKER === */}
            {showImagePicker && (
                <View style={styles.imagePickerContainer}>
                    {imageOptions.map((img) => (
                        <TouchableOpacity
                            key={img.uri}
                            style={[
                                styles.imageOption,
                                image?.uri === img.uri && styles.imageOptionSelected,
                            ]}
                            onPress={() => handleSelectImage(img)}
                        >
                            <Image source={img.source} style={styles.optionThumb} />
                            <Text style={styles.optionLabel}>{img.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* === FORM === */}
            <TextInput style={styles.input} placeholder="Hike Name" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
            <TextInput style={styles.input} placeholder="Date" value={date} onChangeText={setDate} />
            <TextInput style={styles.input} placeholder="Parking" value={parking} onChangeText={setParking} />
            <TextInput
                style={styles.input}
                placeholder="Length (km)"
                keyboardType="numeric"
                value={length}
                onChangeText={setLength}
            />
            <TextInput style={styles.input} placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} />
            <TextInput style={styles.input} placeholder="Weather" value={weather} onChangeText={setWeather} />
            <TextInput style={styles.input} placeholder="Companions" value={companions} onChangeText={setCompanions} />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                multiline
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdateHike}>
                <Text style={styles.buttonText}>Update Hike</Text>
            </TouchableOpacity>

            {/* === OBSERVATIONS === */}
            <Text style={styles.sectionTitle}>Observations</Text>
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
                value={observationText}
                onChangeText={setObservationText}
            />
            <TextInput
                style={styles.input}
                placeholder="Comment (optional)"
                value={comment}
                onChangeText={setComment}
            />
            <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddObservation}>
                <Text style={styles.buttonText}>Add Observation</Text>
            </TouchableOpacity>

            <Toast />
        </ScrollView>
    );
}

// === STYLES ===
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA", padding: 20 },
    hikeImage: { width: "100%", height: 200, borderRadius: 8, backgroundColor: "#ccc" },
    changeButton: {
        alignSelf: "flex-start",
        marginTop: 8,
        backgroundColor: "#000",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    changeButtonText: { color: "#fff", fontWeight: "bold" },
    imagePickerContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
    },
    imageOption: {
        width: "30%",
        margin: "1.5%",
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        borderRadius: 8,
    },
    imageOptionSelected: { borderColor: "#2196F3" },
    optionThumb: { width: 90, height: 90, borderRadius: 6 },
    optionLabel: { fontSize: 13, color: "#000", marginTop: 4 },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginTop: 10,
    },
    textArea: { minHeight: 80, textAlignVertical: "top" },
    button: { borderRadius: 6, paddingVertical: 12, alignItems: "center", marginTop: 16 },
    updateButton: { backgroundColor: "#2196F3" },
    addButton: { backgroundColor: "#2E7D32" },
    buttonText: { color: "#fff", fontWeight: "bold" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginTop: 24, marginBottom: 8 },
    obsListContainer: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
    },
    obsItem: { flexDirection: "row", paddingVertical: 4 },
    obsItemText: { fontSize: 15 },
    obsComment: { fontSize: 15, fontStyle: "italic", color: "#555", marginLeft: 4 },
});
