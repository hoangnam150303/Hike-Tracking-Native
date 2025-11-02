import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";

// `expo-sqlite` không cần 'enablePromise'. API async đã có sẵn.

const DATABASE_NAME = "Hiking.db";
let db: SQLite.SQLiteDatabase | null = null;

// --- OPEN DATABASE ---
export const openDB = async (): Promise<SQLite.SQLiteDatabase> => {
  // Singleton pattern: Nếu db đã mở, trả về nó
  if (db) return db;

  try {
    // Sử dụng openDatabaseAsync cho API mới
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log("✅ Database opened:", DATABASE_NAME);
    return db;
  } catch (error) {
    console.error("❌ Failed to open database:", error);
    Toast.show({
      type: "error",
      text1: "Database Error",
      text2: "Cannot open database",
    });
    throw error; // Ném lỗi để hàm gọi nó có thể bắt
  }
};

// --- INIT TABLES ---
export const initDB = async () => {
  try {
    const db = await openDB();

    // Sử dụng withTransactionAsync cho transaction
    await db.withTransactionAsync(async () => {
      // Bên trong withTransactionAsync, bạn chỉ cần await các câu lệnh
      // Không cần đối tượng 'tx'
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS User (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          username TEXT,
          password TEXT
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS Hike (
          hike_id INTEGER PRIMARY KEY AUTOINCREMENT,
          hike_name TEXT NOT NULL,
          location TEXT NOT NULL,
          date TEXT NOT NULL,
          parking TEXT NOT NULL,
          length REAL NOT NULL,
          difficulty TEXT NOT NULL,
          description TEXT,
          weather TEXT,
          companions TEXT,
          photo_uri TEXT,
          user_id INTEGER,
          FOREIGN KEY(user_id) REFERENCES User(user_id)
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS Observation (
          observation_id INTEGER PRIMARY KEY AUTOINCREMENT,
          hike_id INTEGER,
          observation TEXT NOT NULL,
          time TEXT NOT NULL,
          comment TEXT,
          FOREIGN KEY(hike_id) REFERENCES Hike(hike_id)
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS Comment (
          comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
          hike_id INTEGER,
          user_id INTEGER,
          content TEXT,
          timestamp TEXT,
          FOREIGN KEY(hike_id) REFERENCES Hike(hike_id),
          FOREIGN KEY(user_id) REFERENCES User(user_id)
        );
      `);
    });
    console.log("✅ Tables created successfully");
  } catch (error) {
    console.error("❌ Table creation failed:", error);
    Toast.show({
      type: "error",
      text1: "Database Error",
      text2: "Failed to initialize tables",
    });
  }
};

//
// =============== USER AUTHENTICATION ===============
//
export const checkEmail = async (email: string): Promise<boolean> => {
  try {
    const db = await openDB();
    // getFirstAsync trả về object hoặc null, hoàn hảo để kiểm tra tồn tại
    const result = await db.getFirstAsync(
      "SELECT * FROM User WHERE email = ?",
      [email]
    );
    return !!result; // !!result sẽ là true nếu object tồn tại, false nếu null
  } catch (error) {
    console.error("Check email error:", error);
    Toast.show({
      type: "error",
      text1: "Database Error",
      text2: "Cannot check email",
    });
    return false;
  }
};

export const insertUser = async (
  email: string,
  password: string,
  username: string
): Promise<boolean> => {
  try {
    const db = await openDB();

    // Bỏ check if (!db) vì openDB() sẽ throw error nếu thất bại
    // nên code sẽ không chạy tới đây nếu db là null.

    console.log(password, email, username);
    // Dùng runAsync cho INSERT, UPDATE, DELETE
    const result = await db.runAsync(
      "INSERT INTO User (email, password, username) VALUES (?, ?, ?)",
      [email, password, username]
    );
    console.log("Insert result:", result); // result sẽ là { changes: 1, lastInsertRowId: ... }
    Toast.show({ type: "success", text1: "Registration Successful 🎉" });
    return true;
  } catch (error: any) {
    console.error("Insert User error:", error);
    Toast.show({
      type: "error",
      text1: "Registration Failed",
      text2: error.message || "Could not insert user",
    });
    return false;
  }
};
interface User {
  user_id: number;
  username: string;
}
export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  // <-- 1. ĐỔI KIỂU TRẢ VỀ
  try {
    const db = await openDB();
    console.log(email, password);

    // 2. Chỉ SELECT 2 trường bạn cần
    // Thêm <User> để TypeScript biết kiểu trả về
    const result = await db.getFirstAsync<User>(
      "SELECT user_id, username FROM User WHERE email=? AND password=?",
      [email, password]
    );

    // 3. KIỂM TRA KẾT QUẢ
    if (result) {
      // Tìm thấy user, hiển thị Toast thành công
      Toast.show({ type: "success", text1: "Login Successful ✅" });

      // 4. TRẢ VỀ DATA CỦA USER
      return result;
    } else {
      // Không tìm thấy (sai info), hiển thị Toast lỗi
      Toast.show({
        type: "error",
        text1: "Invalid Credentials",
        text2: "Please try again",
      });

      // 5. TRẢ VỀ NULL
      return null;
    }
  } catch (error) {
    console.error("Login error:", error);
    Toast.show({
      type: "error",
      text1: "Login Failed",
      text2: "Database error",
    });
    // 6. TRẢ VỀ NULL KHI LỖI
    return null;
  }
};

//
// =============== HIKE CRUD ===============
//
export const insertHike = async (
  name: string,
  location: string,
  date: string,
  parking: string,
  length: number,
  difficulty: string,
  description: string,
  weather: string,
  companions: string,
  photoUri: string,
  userId: number
): Promise<boolean> => {
  try {
    const db = await openDB();
    // Dùng runAsync cho INSERT
    const result = await db.runAsync(
      `INSERT INTO Hike 
       (hike_name, location, date, parking, length, difficulty, description, weather, companions, photo_uri, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location,
        date,
        parking,
        length,
        difficulty,
        description,
        weather,
        companions,
        photoUri,
        userId,
      ]
    );
    console.log(result);
    Toast.show({ type: "success", text1: "Hike Added Successfully" });
    return true;
  } catch (error) {
    console.error("Insert Hike error:", error);
    Toast.show({
      type: "error",
      text1: "Insert Failed",
      text2: "Could not add hike",
    });
    return false;
  }
};

export const getAllHikes = async (): Promise<any[]> => {
  try {
    const db = await openDB();
    // Dùng getAllAsync để lấy tất cả các hàng
    const results = await db.getAllAsync("SELECT * FROM Hike");
    return results; // getAllAsync đã trả về mảng, không cần .raw()
  } catch (error) {
    console.error("Get hikes error:", error);
    Toast.show({
      type: "error",
      text1: "Load Failed",
      text2: "Cannot load hikes",
    });
    return [];
  }
};
export const getUserHikes = async (userId: number): Promise<any[]> => {
  try {
    const db = await openDB();

    // Gọi query có điều kiện user_id
    const results = await db.getAllAsync(
      `
      SELECT h.*, u.username
      FROM Hike h
      LEFT JOIN User u ON h.user_id = u.user_id
      WHERE h.user_id = ?
      ORDER BY h.hike_id DESC
      `,
      [userId]
    );

    console.log(`✅ Loaded ${results.length} hikes for user ${userId}`);
    return results;
  } catch (error) {
    console.error("❌ getUserHikes error:", error);
    Toast.show({
      type: "error",
      text1: "Load Failed",
      text2: "Cannot load your hikes",
    });
    return [];
  }
};
export const getHikeById = async (hikeId: number): Promise<any | null> => {
  try {
    const db = await openDB(); // Dùng getFirstAsync để lấy 1 hàng duy nhất
    const hike = await db.getFirstAsync(
      "SELECT * FROM Hike WHERE hike_id = ?",
      [hikeId]
    );

    if (hike) {
      return hike; // Trả về object hike nếu tìm thấy
    } else {
      console.warn(`Warn: Không tìm thấy hike với id ${hikeId}`);
      return null;
    }
  } catch (error) {
    console.error("Get hike by ID error:", error);
    Toast.show({
      type: "error",
      text1: "Load Failed",
      text2: "Cannot load hike details",
    });
    return null;
  }
};
export const updateHike = async (
  id: number,
  name: string,
  location: string,
  date: string,
  parking: string,
  length: number,
  difficulty: string,
  description: string,
  weather: string,
  companions: string,
  photoUri: string
): Promise<boolean> => {
  try {
    const db = await openDB();
    // Dùng runAsync cho UPDATE
    await db.runAsync(
      `UPDATE Hike SET 
       hike_name=?, location=?, date=?, parking=?, length=?, difficulty=?, description=?, weather=?, companions=?, photo_uri=?
       WHERE hike_id=?`,
      [
        name,
        location,
        date,
        parking,
        length,
        difficulty,
        description,
        weather,
        companions,
        photoUri,
        id,
      ]
    );
    Toast.show({ type: "success", text1: "Hike Updated Successfully" });
    return true;
  } catch (error) {
    console.error("Update hike error:", error);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: "Could not update hike",
    });
    return false;
  }
};

export const deleteHike = async (id: number): Promise<boolean> => {
  try {
    const db = await openDB();
    // Dùng runAsync cho DELETE
    await db.runAsync("DELETE FROM Hike WHERE hike_id=?", [id]);
    Toast.show({ type: "success", text1: "Hike Deleted" });
    return true;
  } catch (error) {
    console.error("Delete hike error:", error);
    Toast.show({
      type: "error",
      text1: "Delete Failed",
      text2: "Could not delete hike",
    });
    return false;
  }
};

//
// =============== COMMENT CRUD ===============
//
export const insertComment = async (
  hikeId: number,
  userId: number,
  content: string,
  timestamp: string
): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync(
      "INSERT INTO Comment (hike_id, user_id, content, timestamp) VALUES (?, ?, ?, ?)",
      [hikeId, userId, content, timestamp]
    );
    Toast.show({ type: "success", text1: "Comment Added" });
    return true;
  } catch (error) {
    console.error("Insert Comment error:", error);
    Toast.show({
      type: "error",
      text1: "Comment Failed",
      text2: "Could not save comment",
    });
    return false;
  }
};

export const getCommentsByHike = async (hikeId: number): Promise<any[]> => {
  try {
    const db = await openDB();
    // Dùng getAllAsync
    const results = await db.getAllAsync(
      `SELECT c.*, u.username 
       FROM Comment c 
       LEFT JOIN User u ON c.user_id = u.user_id 
       WHERE c.hike_id = ? 
       ORDER BY c.comment_id DESC`,
      [hikeId]
    );
    return results; // Trả về mảng
  } catch (error) {
    console.error("Get comments error:", error);
    Toast.show({
      type: "error",
      text1: "Load Failed",
      text2: "Cannot load comments",
    });
    return [];
  }
};

export const updateComment = async (
  commentId: number,
  newContent: string,
  newTimestamp: string
): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync(
      "UPDATE Comment SET content=?, timestamp=? WHERE comment_id=?",
      [newContent, newTimestamp, commentId]
    );
    Toast.show({ type: "success", text1: "Comment Updated" });
    return true;
  } catch (error) {
    console.error("Update Comment error:", error);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: "Could not update comment",
    });
    return false;
  }
};

export const deleteComment = async (commentId: number): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync("DELETE FROM Comment WHERE comment_id=?", [commentId]);
    Toast.show({ type: "success", text1: "Comment Deleted" });
    return true;
  } catch (error) {
    console.error("Delete Comment error:", error);
    Toast.show({
      type: "error",
      text1: "Delete Failed",
      text2: "Could not delete comment",
    });
    return false;
  }
};

//
// =============== OBSERVATION CRUD ===============
//
export const insertObservation = async (
  hikeId: number,
  observation: string,
  time: string,
  comment: string
): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync(
      "INSERT INTO Observation (hike_id, observation, time, comment) VALUES (?, ?, ?, ?)",
      [hikeId, observation, time, comment]
    );
    Toast.show({ type: "success", text1: "Observation Added" });
    return true;
  } catch (error) {
    console.error("Insert Observation error:", error);
    Toast.show({
      type: "error",
      text1: "Insert Failed",
      text2: "Could not add observation",
    });
    return false;
  }
};

export const getObservationsByHike = async (hikeId: number): Promise<any[]> => {
  try {
    const db = await openDB();
    // Dùng getAllAsync
    const results = await db.getAllAsync(
      "SELECT * FROM Observation WHERE hike_id=? ORDER BY observation_id DESC",
      [hikeId]
    );
    return results; // Trả về mảng
  } catch (error) {
    console.error("Get Observations error:", error);
    Toast.show({
      type: "error",
      text1: "Load Failed",
      text2: "Cannot load observations",
    });
    return [];
  }
};

export const updateObservation = async (
  observationId: number,
  newObservation: string,
  newTime: string,
  newComment: string
): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync(
      "UPDATE Observation SET observation=?, time=?, comment=? WHERE observation_id=?",
      [newObservation, newTime, newComment, observationId]
    );
    Toast.show({ type: "success", text1: "Observation Updated" });
    return true;
  } catch (error) {
    console.error("Update Observation error:", error);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: "Could not update observation",
    });
    return false;
  }
};

export const deleteObservation = async (
  observationId: number
): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.runAsync("DELETE FROM Observation WHERE observation_id=?", [
      observationId,
    ]);
    Toast.show({ type: "success", text1: "Observation Deleted" });
    return true;
  } catch (error) {
    console.error("Delete Observation error:", error);
    Toast.show({
      type: "error",
      text1: "Delete Failed",
      text2: "Could not delete observation",
    });
    return false;
  }
};
