import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { account } from './appwriteConfig';
import App from './App';
import Landing from './pages/Landing';
import Auth from './components/Auth';
import EmailVerifyCallback from './components/EmailVerifyCallback';
import EditProfile from './pages/EditProfile';
import { UniversityLevel } from './types';
import { Models } from 'appwrite';
import AdminDashboard from './pages/AdminDashboard';

const Router: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2240AF]"></div>
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
      <Route path="/verify" element={<EmailVerifyCallback />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
