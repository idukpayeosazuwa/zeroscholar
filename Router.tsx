import React, { useState, useEffect } from 'react';
import { account } from './appwriteConfig';
import App from './App';
import Landing from './pages/Landing';

interface RouterState {
  isAuthenticated: boolean | null;
  forceShowAuth: boolean;
}

export const authContext = React.createContext<{
  forceAuthPage: () => void;
}>({
  forceAuthPage: () => {}
});

const Router: React.FC = () => {
  const [state, setState] = useState<RouterState>({
    isAuthenticated: null,
    forceShowAuth: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
        setState({ isAuthenticated: true, forceShowAuth: false });
      } catch {
        setState({ isAuthenticated: false, forceShowAuth: false });
      }
    };
    checkAuth();
  }, []);

  // While checking auth status, show nothing
  if (state.isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2240AF]"></div>
      </div>
    );
  }

  // If authenticated, show the app. Otherwise, show landing page (unless forced to auth)
  const showApp = state.isAuthenticated && !state.forceShowAuth;
  
  return (
    <authContext.Provider value={{ 
      forceAuthPage: () => setState(prev => ({ ...prev, forceShowAuth: true })) 
    }}>
      {showApp ? <App /> : <Landing />}
    </authContext.Provider>
  );
};

export default Router;
