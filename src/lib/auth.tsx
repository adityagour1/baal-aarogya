import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Quarter } from './types';

export type UserRole = 'teacher' | 'admin';
export interface AuthUser { 
  username: string; 
  role: UserRole; 
  assignedClass?: string; 
  password?: string; 
}

interface AuthContextType {
  user: AuthUser | null; 
  allUsers: AuthUser[]; 
  userDb: AuthUser[]; // Added to fix the Settings page error
  activeQuarter: Quarter;
  isWindowOpen: boolean; 
  setWindowStatus: (status: boolean) => void;
  login: (u: string, p: string) => string | null;
  registerUser: (u: AuthUser) => void;
  deleteUser: (u: string) => void;
  updateTeacherClass: (u: string, c: string) => void;
  updateActiveQuarter: (q: Quarter) => void;
  logout: () => void;
  isAdmin: boolean; 
  isTeacher: boolean;
}

// Rebranded Keys for Baal Aarogya
const AUTH_KEY = 'baal-aarogya-auth-v1';
const USERS_DB_KEY = 'baal-aarogya-users-db-v1';
const QUARTER_KEY = 'baal-aarogya-active-quarter-v1';
const WINDOW_STATUS_KEY = 'baal-aarogya-window-status-v1';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // --- STATE INITIALIZATION ---
  const [userDbState, setUserDbState] = useState<Record<string, AuthUser>>(() => 
    JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{"admin":{"username":"admin","password":"admin123","role":"admin"}}')
  );
  
  const [user, setUser] = useState<AuthUser | null>(() => 
    JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  );
  
  const [activeQuarter, setActiveQuarter] = useState<Quarter>(() => 
    (localStorage.getItem(QUARTER_KEY) as Quarter) || 'Q1'
  );

  const [isWindowOpen, setIsWindowOpen] = useState<boolean>(() => 
    localStorage.getItem(WINDOW_STATUS_KEY) === 'true'
  );

  // --- PERSISTENCE ---
  useEffect(() => { 
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(userDbState)); 
    localStorage.setItem(QUARTER_KEY, activeQuarter); 
    localStorage.setItem(WINDOW_STATUS_KEY, isWindowOpen.toString());
  }, [userDbState, activeQuarter, isWindowOpen]);

  useEffect(() => { 
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user)); 
    else localStorage.removeItem(AUTH_KEY); 
  }, [user]);

  // --- ACTIONS ---
  const login = (u: string, p: string) => {
    const key = u.toLowerCase().trim();
    const entry = userDbState[key];
    if (!entry || entry.password !== p) return 'Invalid credentials';
    
    const { password, ...sessionUser } = entry;
    setUser(sessionUser);
    return null;
  };

  const logout = () => { 
    setUser(null); 
    toast.success("Signed Out Successfully"); 
  };

  const registerUser = (data: AuthUser) => { 
    const key = data.username.toLowerCase().trim(); 
    setUserDbState(prev => ({ ...prev, [key]: { ...data, username: key } })); 
    toast.success(`${data.role === 'admin' ? 'Administrator' : 'Faculty'} Registered`); 
  };

  const deleteUser = (u: string) => { 
    const key = u.toLowerCase().trim(); 
    setUserDbState(prev => { 
      const newState = { ...prev }; 
      delete newState[key]; 
      return newState; 
    }); 
    if (user?.username === key) logout(); 
    toast.info("User Account Removed"); 
  };

  const updateTeacherClass = (u: string, c: string) => { 
    const key = u.toLowerCase().trim(); 
    if (!userDbState[key]) return;
    setUserDbState(prev => ({ 
      ...prev, 
      [key]: { ...prev[key], assignedClass: c.toUpperCase().trim() } 
    })); 
    toast.success("Class Assignment Updated"); 
  };

  const updateActiveQuarter = (q: Quarter) => { 
    setActiveQuarter(q); 
    toast.success(`System Phase: ${q}`); 
  };

  const setWindowStatus = (status: boolean) => {
    setIsWindowOpen(status);
    status 
      ? toast.success(`Assessment Window Opened`) 
      : toast.info("Window Closed: View Only Mode");
  };

  const usersArray = Object.values(userDbState);

  return (
    <AuthContext.Provider value={{ 
      user, 
      allUsers: usersArray, 
      userDb: usersArray, // Explicitly added to fix your Settings.tsx error
      activeQuarter,
      isWindowOpen,
      setWindowStatus,
      login, 
      registerUser, 
      deleteUser, 
      updateTeacherClass, 
      updateActiveQuarter, 
      logout, 
      isAdmin: user?.role === 'admin', 
      isTeacher: user?.role === 'teacher' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { 
  const ctx = useContext(AuthContext); 
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider'); 
  return ctx; 
}