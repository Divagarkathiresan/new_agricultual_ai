import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { ConfirmationResult, User } from "firebase/auth";

interface AuthContextType {
  // Logged in Firebase user
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  // Firebase OTP confirmation object
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: React.Dispatch<
    React.SetStateAction<ConfirmationResult | null>
  >;

  // Loading State
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        confirmationResult,
        setConfirmationResult,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};