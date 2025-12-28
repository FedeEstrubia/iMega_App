
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Profile, LevelRule, AppState } from './types';
import { Repository, supabase } from './lib/repository';
import { Navbar } from './components/Navbar';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { AdminPage } from './pages/AdminPage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    isAdmin: false,
    viewingAsLevel: null,
    blueRate: 1200,
    whatsappNumber: '',
    levelRules: [],
  });
  const [loading, setLoading] = useState(true);

  const initApp = async () => {
    try {
      const profile = await Repository.getMyProfile();
      const settings = await Repository.getSettings();
      const levelRules = await Repository.getLevelRules();

      setAppState(prev => ({
        ...prev,
        user: profile,
        isAdmin: profile?.role === 'admin',
        blueRate: settings.blue_rate,
        whatsappNumber: settings.whatsapp_number,
        levelRules: levelRules
      }));
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Inicialización inicial
    initApp();

    // Escuchar cambios de autenticación (Magic Link, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        await initApp();
      } else if (event === 'SIGNED_OUT') {
        setAppState(prev => ({ ...prev, user: null, isAdmin: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLevelOverride = (lvl: number | null) => {
    setAppState(prev => ({ ...prev, viewingAsLevel: lvl }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl mb-4"> iStore</div>
          <div className="h-1 w-24 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black animate-[loading_1.5s_infinite]"></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar 
          user={appState.user} 
          isAdmin={appState.isAdmin} 
          onLogout={() => setAppState(p => ({ ...p, user: null, isAdmin: false }))} 
        />
        
        {appState.viewingAsLevel && (
          <div className="bg-blue-600 text-white text-center text-xs py-1 font-bold sticky top-[64px] z-40">
            SIMULANDO NIVEL {appState.viewingAsLevel} • <button onClick={() => handleLevelOverride(null)} className="underline">Restablecer</button>
          </div>
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage appState={appState} />} />
            <Route path="/product/:id" element={<ProductDetailPage appState={appState} />} />
            <Route path="/login" element={appState.user ? <Navigate to="/" /> : <LoginPage onLogin={initApp} />} />
            <Route 
              path="/account" 
              element={appState.user ? <AccountPage appState={appState} refreshUser={initApp} /> : <Navigate to="/login" />} 
            />
            <Route path="/benefits" element={<BenefitsPage levelRules={appState.levelRules} />} />
            <Route 
              path="/admin/*" 
              element={appState.isAdmin ? <AdminPage appState={appState} refreshApp={initApp} onOverride={handleLevelOverride} /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} iStore Marketplace. Calidad garantizada.</p>
            <p className="text-xs text-gray-400 mt-2">No oficial - Estética inspirada en Apple Inc.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
