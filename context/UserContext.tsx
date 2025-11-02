import React, { createContext, useContext, useState } from "react";

// 1. Định nghĩa kiểu dữ liệu User (chỉ 2 trường bạn cần)
interface User {
  user_id: number;
  username: string;
}

// 2. Định nghĩa kiểu của Context
interface UserContextType {
  user: User | null; // "GET": Dùng 'user' để lấy data
  setUser: (user: User | null) => void; // "SET": Dùng 'setUser' để set data
}

// 3. Tạo Context
// Giá trị mặc định là 'undefined' để phát hiện lỗi nếu quên bọc Provider
const UserContext = createContext<UserContextType | undefined>(undefined);

// 4. Tạo Provider
// Component này sẽ bọc (wrap) toàn bộ ứng dụng của bạn
export function UserProvider({ children }: { children: React.ReactNode }) {
  // Đây là nơi lưu trữ data
  const [user, setUser] = useState<User | null>(null);

  // Cung cấp 2 giá trị: 'user' (để get) và 'setUser' (để set)
  const value = {
    user,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 5. Tạo Hook tùy chỉnh
// Giúp bạn gọi 'get' và 'set' dễ dàng hơn
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Nếu bạn quên bọc <UserProvider>, app sẽ báo lỗi
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
