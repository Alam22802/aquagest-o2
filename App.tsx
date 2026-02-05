
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LineManagement from './components/LineManagement';
import BatchManagement from './components/BatchManagement';
import CageManagement from './components/CageManagement';
import CageInventory from './components/CageInventory';
import Maintenance from './components/Maintenance';
import FeedingLog from './components/FeedingLog';
import MortalityLog from './components/MortalityLog';
import BiometryLog from './components/BiometryLog';
import FeedManagement from './components/FeedManagement';
import UserManagement from './components/UserManagement';
import CloudSettings from './components/CloudSettings';
import WaterQuality from './components/WaterQuality';
import Login from './components/Login';
import { loadState, saveState, getSession, saveSession } from './store';
import { AppState, User } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initApp = useCallback(async () => {
    try {
      const savedUser = getSession();
      if (savedUser) setCurrentUser(savedUser);
      const data = await loadState();
      setState(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { initApp(); }, [initApp]);

  useEffect(() => {
    if (state && !isLoading) { saveState(state); }
  }, [state, isLoading]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveSession(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (!state || !currentUser) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'water': return <WaterQuality state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'inventory': return <CageInventory state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'maintenance': return <Maintenance state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'batches': return <BatchManagement state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'lines': return <LineManagement state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'cages': return <CageManagement state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'feed': return <FeedManagement state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'feeding': return <FeedingLog state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'biometry': return <BiometryLog state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'mortality': return <MortalityLog state={state} onUpdate={setState} currentUser={currentUser} />;
      case 'users': return <UserManagement state={state} onUpdate={setState} />;
      case 'cloud': return <CloudSettings state={state} onUpdate={setState} />;
      default: return <Dashboard state={state} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-black tracking-widest uppercase italic">AquaGestão</h2>
      </div>
    );
  }

  return (
    <>
      {!currentUser ? (
        <Login state={state!} onLogin={handleLogin} onRegister={(u) => { setState({ ...state!, users: [...state!.users, u] }); handleLogin(u); }} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} state={state!}>
          {renderContent()}
        </Layout>
      )}
    </>
  );
};

export default App;
