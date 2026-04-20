import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx' // ✅ ADD THIS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <ThemeProvider> {/* ✅ WRAP HERE */}
          <App />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  </StrictMode>,
)