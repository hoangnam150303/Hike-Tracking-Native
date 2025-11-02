import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Card from "../components/Card";

export default function AllHikesScreen() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [filteredHikes, setFilteredHikes] = useState([
        { id: "1", name: "Mount Snowdon", length: "8.5 km" },
        { id: "2", name: "Ben Nevis", length: "10.2 km" },
        { id: "3", name: "Trosley Park", length: "5.3 km" },
        { id: "4", name: "Llyn Idwal", length: "6.1 km" },
    ]);

    const images = [
        require("../assets/hero1.jpg"),
        require("../assets/hero2.jpg"),
        require("../assets/hero3.jpg"),
        require("../assets/hero4.jpg"),
    ];

    const handleSearch = () => {
        console.log("Searching for:", search);
    };

    const handleFilter = (type: string) => {
        console.log("Filter by:", type);
    };

    return (
        <FlatList
            data={filteredHikes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.cardRow}
            ListHeaderComponent={
                <>
                    {/* --- PAGE TITLE --- */}
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
                </>
            }
            renderItem={({ item, index }) => (
                <Card
                    key={item.id}
                    id={item.id}
                    title={item.name}
                    length={item.length}
                    image={images[index % images.length]}
                />
            )}
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
    cardRow: {
        justifyContent: "space-between",
    },
});
