import { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './App.css';

export const AppContext = createContext();

function App() {
  const [token, setToken] = useState(localStorage.getItem('ghibli_token') || null);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('ghibli_theme_mode') || 'dark');
  const [theme, setTheme] = useState('morning');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('ghibli_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ghibli_token', token);
      fetchUser();
    } else {
      localStorage.removeItem('ghibli_token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTheme('login-bg');
      return;
    }

    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTheme('morning');
      else if (hour >= 12 && hour < 18) setTheme('afternoon');
      else setTheme('night');
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setToken(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ token, setToken, user, fetchUser, themeMode, setThemeMode }}>
      <div className={`app-container ${theme} ${themeMode === 'light' ? 'light' : ''}`}>
        <div className="theme-overlay"></div>
        <Router>
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    </AppContext.Provider>
  );
}

export default App;
