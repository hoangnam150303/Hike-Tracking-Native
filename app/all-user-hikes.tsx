import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Card from "../components/Card";
import { useUser } from "../context/UserContext";
import { deleteAllHikes, getUserHikes } from "../utils/dbhelper";

export default function AllUserHikesScreen() {
    const { user } = useUser();
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [userHikes, setUserHikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Fetch hikes khi user load
    useEffect(() => {
        if (!user) return;
        fetchUserHikes();
    }, [user]);

    const fetchUserHikes = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const hikes = await getUserHikes(user.user_id);
            setUserHikes(hikes);
        } catch (error) {
            console.error("❌ Error fetching user hikes:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Delete All
    const handleDeleteAll = async () => {
        if (!user) return;
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete all your hikes?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteAllHikes(user.user_id);
                        if (success) fetchUserHikes();
                    },
                },
            ]
        );
    };

    // 🔹 Search
    const handleSearch = () => {
        const keyword = search.toLowerCase();
        if (keyword.trim() === "") {
            fetchUserHikes();
        } else {
            const filtered = userHikes.filter(
                (hike) =>
                    hike.hike_name.toLowerCase().includes(keyword) ||
                    hike.location.toLowerCase().includes(keyword)
            );
            setUserHikes(filtered);
        }
    };

    // 🔹 Filter
    const handleFilter = (type: string) => {
        let sorted = [...userHikes];
        if (type === "length") {
            sorted.sort((a, b) => a.length - b.length);
        } else if (type === "date") {
            sorted.sort((a, b) => b.date.localeCompare(a.date));
        } else if (type === "parking") {
            sorted = sorted.filter((hike) => hike.parking.toLowerCase() === "yes");
        }
        setUserHikes(sorted);
    };

    // 🔹 Loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D47A1" />
                <Text>Loading your hikes...</Text>
            </View>
        );
    }

    const defaultImage = require("../assets/image_hikes/no_image.jpg");

    return (
        <FlatList
            data={userHikes}
            keyExtractor={(item) => item.hike_id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.cardRow}
            ListHeaderComponent={
                <>
                    <Text style={styles.pageTitle}>My Hikes</Text>

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
                        <Picker
                            selectedValue={difficulty}
                            onValueChange={(value) => {
                                setDifficulty(value);
                                if (value === "") {
                                    fetchUserHikes();
                                } else {
                                    setUserHikes(
                                        userHikes.filter(
                                            (hike) =>
                                                hike.difficulty &&
                                                hike.difficulty.toLowerCase() === value.toLowerCase()
                                        )
                                    );
                                }
                            }}
                        >
                            <Picker.Item label="Select difficulty" value="" />
                            <Picker.Item label="Easy" value="Easy" />
                            <Picker.Item label="Moderate" value="Moderate" />
                            <Picker.Item label="Hard" value="Hard" />
                            <Picker.Item label="Extreme" value="Extreme" />
                        </Picker>
                    </View>
                </>
            }
            renderItem={({ item }) => {

                const imageSource =
                    typeof item.photo_uri === "string" && item.photo_uri.trim() !== ""
                        ? { uri: item.photo_uri }
                        : defaultImage;

                return (
                    <Card
                        id={item.hike_id.toString()}
                        title={item.hike_name}
                        length={`${item.length} km`}
                        image={imageSource}
                    />
                );
            }}
            ListFooterComponent={
                userHikes.length > 0 ? (
                    <TouchableOpacity
                        style={styles.deleteAllButton}
                        onPress={handleDeleteAll}
                    >
                        <Text style={styles.deleteAllText}>🗑 Delete All My Hikes</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.noHikesText}>No hikes found.</Text>
                )
            }
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FAF9FF",
        padding: 16,
        paddingBottom: 60,
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
        borderRadius: 6,
        padding: 10,
        backgroundColor: "#fff",
    },
    searchButton: {
        backgroundColor: "#0D47A1",
        borderRadius: 6,
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
        borderRadius: 6,
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
        borderRadius: 6,
        backgroundColor: "#fff",
        marginBottom: 16,
    },
    deleteAllButton: {
        backgroundColor: "#B93338",
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    deleteAllText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    noHikesText: {
        textAlign: "center",
        color: "#888",
        marginTop: 24,
        fontSize: 16,
    },
    cardRow: {
        justifyContent: "space-between",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
