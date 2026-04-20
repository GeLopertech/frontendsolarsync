// src/context/CommunityContext.jsx
// Stores the community chosen at login — drives grid/solar config across all pages
import { createContext, useContext, useState } from 'react';
import { communities } from '../data/seed';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [selected, setSelected] = useState(null); // full community object

  const choose = (value) => {
    const c = communities.find(c => c.value === value);
    setSelected(c || null);
  };

  // Derived solar capacity kW
  const solarCapacityKw = selected
    ? (selected.solarPanels * selected.panelWatts) / 1000
    : 9.6;

  return (
    <CommunityContext.Provider value={{ community: selected, choose, solarCapacityKw }}>
      {children}
    </CommunityContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be inside CommunityProvider');
  return ctx;
}
