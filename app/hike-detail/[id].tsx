import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView, // Giữ lại
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useUser } from "../../context/UserContext";
import {
    getCommentsByHike,
    getHikeById,
    getObservationsByHike
} from "../../utils/dbhelper";

export default function HikeDetailScreen() {
    const router = useRouter();
    const { user } = useUser();

    // --- Lấy ID ---
    const { id } = useLocalSearchParams();
    const hikeId = Array.isArray(id) ? id[0] : id;
    const hikeIdNumber = parseInt(hikeId || "0", 10);

    // --- States ---
    const [isLoading, setIsLoading] = useState(true);
    const [hike, setHike] = useState<any | null>(null);
    const [observations, setObservations] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<any | null>(null);

    // === CÁC HÀM TẢI DỮ LIỆU ===
    const loadHikeData = async () => {
        // ... (Giữ nguyên hàm loadHikeData)
        setIsLoading(true);
        try {
            const [hikeData, obsData, commData] = await Promise.all([
                getHikeById(hikeIdNumber),
                getObservationsByHike(hikeIdNumber),
                getCommentsByHike(hikeIdNumber),
            ]);
            if (hikeData) {
                setHike(hikeData);
            } else {
                Alert.alert("Lỗi", "Không tìm thấy hike.", [{ text: "OK", onPress: () => router.back() }]);
            }
            setObservations(obsData);
            setComments(commData);
        } catch (error) {
            console.error("Failed to load data:", error);
            Toast.show({ type: "error", text1: "Lỗi tải dữ liệu" });
        } finally {
            setIsLoading(false);
        }
    };

    // ... (Giữ nguyên các hàm reload)
    const reloadObservations = async () => { /* ... */ };
    const reloadComments = async () => { /* ... */ };

    useFocusEffect(
        useCallback(() => {
            if (!hikeIdNumber) {
                Alert.alert("Lỗi", "Không tìm thấy ID của hike.");
                router.back();
                return;
            }
            loadHikeData();
        }, [hikeIdNumber])
    );

    // === CÁC HÀM XỬ LÝ (CRUD) ===
    // ... (Giữ nguyên các hàm CRUD: handleDeleteHike, handleDeleteObservation, v...v...)
    const handleDeleteHike = async () => { /* ... */ };
    const handleDeleteObservation = (observationId: number) => { /* ... */ };
    const handleSendComment = async () => { /* ... */ };
    const handleDeleteComment = (commentId: number) => { /* ... */ };
    const handleEditComment = (comment: any) => { /* ... */ };
    const handleCancelEdit = () => { /* ... */ };
    const handleUpdateComment = async () => { /* ... */ };

    // --- LOADING VIEW ---
    if (isLoading || !hike) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1565C0" />
                <Text style={styles.loadingText}>Loading hike details...</Text>
            </View>
        );
    }

    const isHikeOwner = user?.user_id === hike?.user_id;

    // --- RENDER ---
    return (
        // <--- SỬA LỖI KEYBOARD ---
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer} // Sửa style
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            {/* 1. ScrollView chỉ chứa NỘI DUNG HIỂN THỊ */}
            <ScrollView
                style={styles.scrollView} // Sửa style
                contentContainerStyle={styles.scrollContentContainer} // Sửa style
                showsVerticalScrollIndicator={false}
            >
                <Image
                    source={
                        hike.photo_uri
                            ? { uri: hike.photo_uri }
                            : require("../../assets/hero1.jpg")
                    }
                    style={styles.hikeImage}
                    resizeMode="cover"
                />

                {/* ... (Toàn bộ thông tin hike, obs, comments) ... */}
                {/* ... (Thông tin Hike) ... */}
                <Text style={styles.hikeName}>{hike.hike_name}</Text>
                <Text style={styles.location}>{hike.location}</Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Date: </Text>
                    {new Date(hike.date).toLocaleDateString()}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Parking: </Text>
                    {hike.parking}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Length: </Text>
                    {`${hike.length} km`}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Difficulty: </Text>
                    {hike.difficulty}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Weather: </Text>
                    {hike.weather || "N/A"}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.bold}>Companions: </Text>
                    {hike.companions || "N/A"}
                </Text>
                {hike.description && (
                    <Text style={[styles.infoText, styles.description]}>
                        <Text style={styles.bold}>Description: </Text>
                        {hike.description}
                    </Text>
                )}

                {/* --- NÚT HIKE (CHỈ CHỦ HIKE MỚI THẤY) --- */}
                {isHikeOwner && (
                    // ... (Giữ nguyên code nút)
                    <View style={styles.buttonRow}>
                        <Link
                            href={{
                                pathname: "/hike-update/[id]",
                                params: { id: hikeId },
                            }}
                            asChild
                            style={[styles.button, styles.updateButton]}
                        >
                            <TouchableOpacity>
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>
                        </Link>
                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={handleDeleteHike}
                        >
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* --- OBSERVATIONS SECTION (CÓ NÚT XÓA) --- */}
                <Text style={styles.sectionTitle}>Observations</Text>
                {/* ... (Giữ nguyên code Obs) ... */}
                <View style={styles.boxContainer}>
                    {observations.length > 0 ? (
                        observations.map((obs) => (
                            <View key={obs.observation_id} style={styles.itemContainer}>
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemText}>{obs.observation}</Text>
                                    <Text style={styles.itemSubText}>
                                        Time: {new Date(obs.time).toLocaleString()}
                                    </Text>
                                    {obs.comment && (
                                        <Text style={styles.itemSubText}>
                                            Comment: {obs.comment}
                                        </Text>
                                    )}
                                </View>
                                {isHikeOwner && (
                                    <TouchableOpacity
                                        style={styles.deleteCommentButton}
                                        onPress={() => handleDeleteObservation(obs.observation_id)}
                                    >
                                        <Text style={styles.deleteCommentButtonText}>X</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.placeholder}>No observations yet.</Text>
                    )}
                </View>

                {/* --- DIVIDER --- */}
                <View style={styles.divider} />

                {/* --- COMMENTS SECTION (CÓ NÚT SỬA/XÓA) --- */}
                <Text style={styles.sectionTitle}>Comments</Text>
                {/* ... (Giữ nguyên code Comments) ... */}
                <View style={styles.boxContainer}>
                    {comments.length > 0 ? (
                        comments.map((comm) => {
                            const isCommentOwner = user?.user_id === comm.user_id;
                            return (
                                <View key={comm.comment_id} style={styles.itemContainer}>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemText}>{comm.content}</Text>
                                        <Text style={styles.itemSubText}>
                                            By {comm.username || "Unknown"} on{" "}
                                            _ {new Date(comm.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {isCommentOwner && (
                                        <View style={styles.commentActions}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() => handleEditComment(comm)}
                                            >
                                                <Text style={styles.editButtonText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteCommentButton}
                                                onPress={() => handleDeleteComment(comm.comment_id)}
                                            >
                                                <Text style={styles.deleteCommentButtonText}>X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.placeholder}>No comments yet.</Text>
                    )}
                </View>
            </ScrollView>

            {/* 2. View chứa Ô COMMENT INPUT (NẰM NGOÀI SCROLLVIEW) */}
            <View style={styles.commentInputContainer}>
                {editingComment && (
                    <Text style={styles.editingText}>
                        Editing comment...
                    </Text>
                )}
                <View style={styles.commentRow}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={editingComment ? "Update your comment..." : "Write a comment..."}
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    {editingComment && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelEdit}
                        >
                            <Text style={styles.sendButtonText}>X</Text>
                            E                       </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={editingComment ? styles.updateCommentButton : styles.sendButton}
                        onPress={editingComment ? handleUpdateComment : handleSendComment}
                    >
                        <Text style={styles.sendButtonText}>
                            {editingComment ? "Update" : "Send"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Toast />
        </KeyboardAvoidingView>
    );
}

// 7. --- Thêm Styles mới ---
const styles = StyleSheet.create({
    // Sửa lại style container và thêm style mới
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 20,
        paddingBottom: 0, // Xóa padding bottom để input nằm sát
    },
    commentInputContainer: {
        padding: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        backgroundColor: "#FAFAFA",
    },

    // ... (Giữ nguyên các style cũ của bạn từ 'hikeImage' đến 'loadingText')
    hikeImage: {
        width: "100%",
        height: 250,
        backgroundColor: "#ccc",
        borderRadius: 8,
    },
    hikeName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginTop: 16,
    },
    location: {
        fontSize: 16,
        color: "#777",
        marginTop: 4,
    },
    infoText: {
        fontSize: 15,
        marginTop: 6,
        color: "#000",
    },
    bold: {
        fontWeight: "bold",
    },
    description: {
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 6,
    },
    updateButton: {
        backgroundColor: "#1565C0",
    },
    deleteButton: {
        backgroundColor: "#C62828",
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
        marginBottom: 8,
    },
    boxContainer: {
        backgroundColor: "#F2F2F2",
        padding: 10,
        borderRadius: 8,
    },
    placeholder: {
        color: "#777",
        fontStyle: "italic",
    },
    divider: {
        height: 1,
        backgroundColor: "#CCC",
        marginTop: 24,
        marginBottom: 8,
    },
    commentRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    sendButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 70,
    },
    updateCommentButton: {
        backgroundColor: "#FFA000",
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 70,
    },
    cancelButton: {
        backgroundColor: "#757575",
        borderRadius: 25,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    loadingText: {
        marginTop: 10,
        color: "#1565C0",
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 8,
        marginBottom: 8,
    },
    itemContent: {
        flex: 1,
    },
    itemText: {
        fontSize: 15,
        color: "#000",
    },
    itemSubText: {
        fontSize: 12,
        color: "#777",
        marginTop: 4,
    },
    commentActions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: "#1E88E5",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    deleteCommentButton: {
        backgroundColor: "#E53935",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    deleteCommentButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    editingText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#FFA000",
        marginTop: 16,
        marginLeft: 4,
    },
});