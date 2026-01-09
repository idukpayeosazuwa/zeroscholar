import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { account } from './appwriteConfig';
import { getCachedUserSession } from './hooks/useOfflineSync';
import App from './App';
import Landing from './pages/Landing';
import Auth from './components/Auth';
import EditProfile from './pages/EditProfile';
import Privacy from './pages/Privacy';
import { UniversityLevel } from './types';
import { Models } from 'appwrite';
import AdminDashboard from './pages/AdminDashboard';

const Router: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // ALWAYS check cached session first - it's instant and works offline
      const cachedSession = getCachedUserSession();
      const cachedProfile = localStorage.getItem('user_profile');
      
      console.log('[Router] Auth check starting...', {
        online: navigator.onLine,
        hasCachedSession: !!cachedSession,
        hasCachedProfile: !!cachedProfile
      });
      
      // If we have cached data, allow access immediately (optimistic)
      // This enables instant offline access without waiting for network
      if (cachedSession && cachedProfile) {
        console.log('[Router] ✅ Cached session found - allowing immediate access');
        setIsAuthenticated(true);
        
        // If online, verify session in background (don't block)
        if (navigator.onLine) {
          account.get()
            .then(() => console.log('[Router] Session verified online'))
            .catch(() => {
              console.log('[Router] Session invalid - but keeping user logged in with cache');
              // Don't log out - let App.tsx handle it if needed
            });
        }
        return;
      }
      
      // No cached session - must be online to authenticate
      if (!navigator.onLine) {
        console.log('[Router] ❌ Offline with no cached session');
        setIsAuthenticated(false);
        return;
      }
      
      // Online without cache - verify with Appwrite
      try {
        await account.get();
        console.log('[Router] ✅ Online auth successful');
        setIsAuthenticated(true);
      } catch (err) {
        console.log('[Router] ❌ Online auth failed:', err);
        setIsAuthenticated(false);
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) {
        console.warn('[Router] Auth check timeout - checking cache as fallback');
        // Last resort: check cache
        const cachedSession = getCachedUserSession();
        if (cachedSession) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    }, 5000);
    
    checkAuth().finally(() => clearTimeout(timeoutId));
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2240AF]"></div>
        <p className="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  const handleAuthSuccess = (user: Models.User<Models.Preferences>, level: UniversityLevel) => {
    setIsAuthenticated(true);
    navigate('/app');
  };

  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" /> : <Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/app" /> : 
          <div className="min-h-screen bg-gray-50 pt-10">
             <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
        } 
      />
      <Route 
        path="/app/*" 
        element={isAuthenticated ? <App /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
