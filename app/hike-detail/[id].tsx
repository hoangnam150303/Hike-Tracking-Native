import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
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
    deleteComment,
    deleteHike,
    deleteObservation,
    getCommentsByHike,
    getHikeById,
    getObservationsByHike,
    insertComment,
    updateComment,
    updateObservation,
} from "../../utils/dbhelper";

export default function HikeDetailScreen() {
    const router = useRouter();
    const { user } = useUser();

    const { id } = useLocalSearchParams();
    const hikeId = Array.isArray(id) ? id[0] : id;
    const hikeIdNumber = parseInt(hikeId || "0", 10);

    const [isLoading, setIsLoading] = useState(true);
    const [hike, setHike] = useState<any | null>(null);
    const [observations, setObservations] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);

    // COMMENT STATES
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<any | null>(null);

    // OBSERVATION STATES
    const [newObservation, setNewObservation] = useState("");
    const [editingObservation, setEditingObservation] = useState<any | null>(null);

    // === LOAD DATA ===
    const loadHikeData = async () => {
        setIsLoading(true);
        try {
            const [hikeData, obsData, commData] = await Promise.all([
                getHikeById(hikeIdNumber),
                getObservationsByHike(hikeIdNumber),
                getCommentsByHike(hikeIdNumber),
            ]);
            if (hikeData) setHike(hikeData);
            else {
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

    const reloadObservations = async () => {
        const obsData = await getObservationsByHike(hikeIdNumber);
        setObservations(obsData);
    };

    const reloadComments = async () => {
        const commData = await getCommentsByHike(hikeIdNumber);
        setComments(commData);
    };

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

    // === HIKE ===
    const handleDeleteHike = async () => {
        Alert.alert("Delete Hike", "Bạn có chắc chắn muốn xóa hike này không?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const success = await deleteHike(hikeIdNumber);
                    if (success) router.back();
                },
            },
        ]);
    };

    // === OBSERVATION ===
    const handleDeleteObservation = (observationId: number) => {
        Alert.alert("Delete Observation", "Bạn có chắc muốn xóa observation này?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const success = await deleteObservation(observationId);
                    if (success) reloadObservations();
                },
            },
        ]);
    };

    const handleEditObservation = (obs: any) => {
        setEditingObservation(obs);
        setNewObservation(obs.observation);
    };

    const handleCancelEditObservation = () => {
        setEditingObservation(null);
        setNewObservation("");
    };

    const handleUpdateObservation = async () => {
        if (!editingObservation || newObservation.trim() === "") return;

        const success = await updateObservation(
            editingObservation.observation_id,
            newObservation.trim(),
            new Date().toISOString(),
            editingObservation.comment || ""
        );

        if (success) {
            handleCancelEditObservation();
            reloadObservations();
        }
    };

    // === COMMENT ===
    const handleSendComment = async () => {
        if (newComment.trim() === "") return;
        if (!user?.user_id) {
            Toast.show({ type: "error", text1: "Bạn cần đăng nhập để bình luận" });
            return;
        }
        const success = await insertComment(hikeIdNumber, user.user_id, newComment.trim(), new Date().toISOString());
        if (success) {
            setNewComment("");
            reloadComments();
        }
    };

    const handleDeleteComment = (commentId: number) => {
        Alert.alert("Delete Comment", "Bạn có chắc muốn xóa bình luận này?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const success = await deleteComment(commentId);
                    if (success) reloadComments();
                },
            },
        ]);
    };

    const handleEditComment = (comment: any) => {
        setEditingComment(comment);
        setNewComment(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setNewComment("");
    };

    const handleUpdateComment = async () => {
        if (!editingComment || newComment.trim() === "") return;

        const success = await updateComment(
            editingComment.comment_id,
            newComment.trim(),
            new Date().toISOString()
        );

        if (success) {
            handleCancelEdit();
            reloadComments();
        }
    };

    // === RENDER LOADING ===
    if (isLoading || !hike) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1565C0" />
                <Text style={styles.loadingText}>Loading hike details...</Text>
            </View>
        );
    }

    const isHikeOwner = user?.user_id === hike?.user_id;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Image
                    source={hike.photo_uri ? { uri: hike.photo_uri } : require("../../assets/hero1.jpg")}
                    style={styles.hikeImage}
                    resizeMode="cover"
                />

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

                {isHikeOwner && (
                    <View style={styles.buttonRow}>
                        <Link
                            href={{ pathname: "/hike-update/[id]", params: { id: hikeId } }}
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

                {/* === OBSERVATIONS === */}
                <Text style={styles.sectionTitle}>Observations</Text>
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
                                    <View style={styles.commentActions}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => handleEditObservation(obs)}
                                        >
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteCommentButton}
                                            onPress={() => handleDeleteObservation(obs.observation_id)}
                                        >
                                            <Text style={styles.deleteCommentButtonText}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.placeholder}>No observations yet.</Text>
                    )}
                </View>

                <View style={styles.divider} />

                {/* === COMMENTS === */}
                <Text style={styles.sectionTitle}>Comments</Text>
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
                                            {new Date(comm.timestamp).toLocaleDateString()}
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

            {/* === OBSERVATION EDIT FORM === */}
            {editingObservation && (
                <View style={styles.commentInputContainer}>
                    <Text style={styles.editingText}>Editing observation...</Text>
                    <View style={styles.commentRow}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Update your observation..."
                            value={newObservation}
                            onChangeText={setNewObservation}
                        />
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelEditObservation}
                        >
                            <Text style={styles.sendButtonText}>X</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.updateCommentButton}
                            onPress={handleUpdateObservation}
                        >
                            <Text style={styles.sendButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* === COMMENT FORM === */}
            <View style={styles.commentInputContainer}>
                {editingComment && (
                    <Text style={styles.editingText}>Editing comment...</Text>
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
                        </TouchableOpacity>
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

// === STYLES ===
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scrollView: { flex: 1 },
    scrollContentContainer: { padding: 20, paddingBottom: 0 },
    commentInputContainer: {
        padding: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        backgroundColor: "#FAFAFA",
    },
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
    bold: { fontWeight: "bold" },
    description: { marginTop: 10 },
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
    updateButton: { backgroundColor: "#1565C0" },
    deleteButton: { backgroundColor: "#C62828" },
    buttonText: { color: "#fff", fontWeight: "bold" },
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
    placeholder: { color: "#777", fontStyle: "italic" },
    divider: { height: 1, backgroundColor: "#CCC", marginTop: 24, marginBottom: 8 },
    commentRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
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
    sendButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    loadingText: { marginTop: 10, color: "#1565C0" },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 8,
        marginBottom: 8,
    },
    itemContent: { flex: 1 },
    itemText: { fontSize: 15, color: "#000" },
    itemSubText: { fontSize: 12, color: "#777", marginTop: 4 },
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
    editButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    deleteCommentButton: {
        backgroundColor: "#E53935",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    deleteCommentButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    editingText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#FFA000",
        marginTop: 16,
        marginLeft: 4,
    },
});
