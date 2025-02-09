import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  signIn: (username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUsername: (username: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  username: null,
  signIn: async () => {},
  signOut: async () => {},
  setUsername: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  const signIn = async (username?: string) => {
    try {
      setIsLoading(true);
      // We don't need to make an API call here since the signin screen handles that
      setIsAuthenticated(true);
      if (username) {
        setUsername(username);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setIsAuthenticated(false);
      setUsername(null);
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        username,
        signIn, 
        signOut,
        setUsername 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
