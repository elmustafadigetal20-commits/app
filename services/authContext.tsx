
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  biometricLogin: () => Promise<boolean>;
  logout: () => void;
  enableBiometric: (enabled: boolean) => void;
  isBiometricEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Specific User Configuration
const APP_USER: User = {
  id: 'u1',
  name: 'Elmustafa',
  email: 'elmustafa.digital@gmail.com',
  role: UserRole.ADMIN,
  avatar: 'EL'
};

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      // 1. Check Biometric Preference
      const storedBio = localStorage.getItem('digi_biometric');
      if (storedBio === 'true') {
        setIsBiometricEnabled(true);
      }

      // 2. Check User Session
      const storedUser = localStorage.getItem('digi_user');
      const loginTimeStr = localStorage.getItem('digi_login_time');

      if (storedUser && loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        const now = Date.now();

        // Check if 24 hours have passed
        if (now - loginTime > SESSION_DURATION) {
          // Session expired
          logout(); 
        } else {
          // Session valid
          setUser(JSON.parse(storedUser));
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Strict Credential Check
        if (username === 'elmustafa' && password === 'Mustafa.462020') {
          setUser(APP_USER);
          localStorage.setItem('digi_user', JSON.stringify(APP_USER));
          localStorage.setItem('digi_login_time', Date.now().toString()); // Store login time
          resolve(true);
        } else {
          resolve(false);
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const biometricLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Biometric bypasses password check but refreshes session time
        setUser(APP_USER);
        localStorage.setItem('digi_user', JSON.stringify(APP_USER));
        localStorage.setItem('digi_login_time', Date.now().toString());
        resolve(true);
        setIsLoading(false);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('digi_user');
    localStorage.removeItem('digi_login_time');
  };

  const enableBiometric = (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    localStorage.setItem('digi_biometric', String(enabled));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      biometricLogin,
      logout,
      enableBiometric,
      isBiometricEnabled
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
