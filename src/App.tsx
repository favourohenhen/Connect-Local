import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerSearch from './pages/WorkerSearch';
import WorkerProfile from './pages/WorkerProfile';

function App() {
  const { user, role, setUser, setRole } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/search" element={<WorkerSearch />} />
      <Route path="/worker/:id" element={<WorkerProfile />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        !user ? <Login /> : 
        role === 'worker' ? <Navigate to="/dashboard" replace /> : 
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <p className="text-gray-600 mb-4">Finishing account setup...</p>
          <button onClick={() => supabase.auth.signOut()} className="text-primary underline">Sign out to retry if stuck</button>
        </div>
      } />
      <Route path="/signup" element={
        !user ? <Signup /> : 
        role === 'worker' ? <Navigate to="/dashboard" replace /> : 
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <p className="text-gray-600 mb-4">Finishing account setup...</p>
          <button onClick={() => supabase.auth.signOut()} className="text-primary underline">Sign out to retry if stuck</button>
        </div>
      } />
      
      {/* Protected Worker Route */}
      <Route 
        path="/dashboard" 
        element={user && role === 'worker' ? <WorkerDashboard /> : <Navigate to="/login" replace />} 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
