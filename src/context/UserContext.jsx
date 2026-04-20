// src/context/UserContext.jsx
// Stores what the user chose on login: community, connection type, usage limit
import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_profile')) || null; } catch { return null; }
  });

  const saveProfile = (profile) => {
    setUserProfile(profile);
    localStorage.setItem('ss_profile', JSON.stringify(profile));
  };

  const clearProfile = () => {
    setUserProfile(null);
    localStorage.removeItem('ss_profile');
  };

  return (
    <UserContext.Provider value={{ userProfile, saveProfile, clearProfile }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserProfile() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserProfile must be inside UserProvider');
  return ctx;
}
