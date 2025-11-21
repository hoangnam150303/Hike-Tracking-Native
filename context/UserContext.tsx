import React, { createContext, useContext, useState } from "react";

// define types
interface User {
  user_id: number;
  username: string;
}

//define types for context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// create provider
export function UserProvider({ children }: { children: React.ReactNode }) {
  // save user state
  const [user, setUser] = useState<User | null>(null);


  const value = {
    user,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// create hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
