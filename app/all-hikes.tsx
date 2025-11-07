import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Card from "../components/Card";
import { getAllHikes } from "../utils/dbhelper";

export default function AllHikesScreen() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [allHikes, setAllHikes] = useState<any[]>([]);
    const [filteredHikes, setFilteredHikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultImage = require("../assets/image_hikes/no_image.jpg");
    const fallbackImages = [
        require("../assets/hero1.jpg"),
        require("../assets/hero2.jpg"),
        require("../assets/hero3.jpg"),
        require("../assets/hero4.jpg"),
    ];

    useEffect(() => {
        fetchAllHikes();
    }, []);

    const fetchAllHikes = async () => {
        try {
            setLoading(true);
            const hikes = await getAllHikes();
            console.log("✅ Loaded all hikes:", hikes.length);
            setAllHikes(hikes);
            setFilteredHikes(hikes);
        } catch (error) {
            console.error("❌ Error loading hikes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const keyword = search.toLowerCase();
        if (keyword.trim() === "") {
            setFilteredHikes(allHikes);
        } else {
            const filtered = allHikes.filter(
                (hike) =>
                    hike.hike_name.toLowerCase().includes(keyword) ||
                    hike.location.toLowerCase().includes(keyword)
            );
            setFilteredHikes(filtered);
        }
    };

    const handleFilter = (type: string) => {
        let sorted = [...filteredHikes];
        if (type === "length") {
            sorted.sort((a, b) => a.length - b.length);
        } else if (type === "date") {
            sorted.sort((a, b) => b.date.localeCompare(a.date));
        } else if (type === "parking") {
            sorted = sorted.filter((hike) => hike.parking.toLowerCase() === "yes");
        }
        setFilteredHikes(sorted);
    };

    const handleDifficulty = (value: string) => {
        setDifficulty(value);
        if (value === "") {
            setFilteredHikes(allHikes);
        } else {
            const filtered = allHikes.filter(
                (hike) =>
                    hike.difficulty &&
                    hike.difficulty.toLowerCase() === value.toLowerCase()
            );
            setFilteredHikes(filtered);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D47A1" />
                <Text>Loading hikes...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={filteredHikes}
            keyExtractor={(item) => item.hike_id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.cardRow}
            ListHeaderComponent={
                <>
                    <Text style={styles.pageTitle}>All Hikes</Text>

                    {/* --- SEARCH BAR --- */}
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search hikes..."
                            value={search}
                            onChangeText={setSearch}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- FILTER BUTTONS --- */}
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[styles.filterButton, { backgroundColor: "#2E7D32" }]}
                            onPress={() => handleFilter("length")}
                        >
                            <Text style={styles.filterText}>Length</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterButton, { backgroundColor: "#E65100" }]}
                            onPress={() => handleFilter("date")}
                        >
                            <Text style={styles.filterText}>Date</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterButton, { backgroundColor: "#0D47A1" }]}
                            onPress={() => handleFilter("parking")}
                        >
                            <Text style={styles.filterText}>Parking</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- DIFFICULTY PICKER --- */}
                    <Text style={styles.label}>Filter by Difficulty</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={difficulty} onValueChange={handleDifficulty}>
                            <Picker.Item label="Select difficulty" value="" />
                            <Picker.Item label="Easy" value="Easy" />
                            <Picker.Item label="Moderate" value="Moderate" />
                            <Picker.Item label="Hard" value="Hard" />
                            <Picker.Item label="Extreme" value="Extreme" />
                        </Picker>
                    </View>
                </>
            }
            renderItem={({ item, index }) => {
                // ✅ Ưu tiên ảnh trong DB, nếu rỗng thì fallback
                const imageSource =
                    typeof item.photo_uri === "string" && item.photo_uri.trim() !== ""
                        ? { uri: item.photo_uri }
                        : fallbackImages[index % fallbackImages.length] || defaultImage;

                return (
                    <Card
                        id={item.hike_id.toString()}
                        title={item.hike_name}
                        length={`${item.length} km`}
                        image={imageSource}
                    />
                );
            }}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FAF9FF",
        padding: 16,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 12,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        backgroundColor: "#fff",
    },
    searchButton: {
        backgroundColor: "#0D47A1",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginLeft: 8,
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    filterButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 10,
        marginHorizontal: 4,
        alignItems: "center",
    },
    filterText: {
        color: "#fff",
        fontWeight: "bold",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 6,
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 16, // 🌿 bo tròn hơn
        backgroundColor: "#fff",
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardRow: {
        justifyContent: "space-between",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
