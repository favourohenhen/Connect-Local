import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldX, ArrowLeft, Phone, MapPin, LogOut, Eye, RefreshCw } from 'lucide-react';

// Hardcoded admin credentials (MVP)
const ADMIN_PHONE = '08000000000';
const ADMIN_PASSWORD = 'admin1234';

interface PendingWorker {
  id: string;
  profiles?: { full_name: string };
  service_category: string;
  street?: string;
  location_area?: string;
  contact_phone?: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  status: string;
  trust_score: number;
  recommended_by?: number;
  created_at?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PendingWorker | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone === ADMIN_PHONE && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid admin credentials.');
    }
  };

  const fetchPendingWorkers = () => {
    setLoading(true);
    // Pull from localStorage
    const localWorkers: PendingWorker[] = JSON.parse(localStorage.getItem('local_workers') || '[]');
    const pending = localWorkers.filter(w => w.status === 'unverified');

    // Also attempt Supabase
    supabase
      .from('workers')
      .select('*, profiles!workers_id_fkey(full_name)')
      .eq('status', 'unverified')
      .then(({ data }) => {
        const dbPending = (data as unknown as PendingWorker[]) || [];
        // Merge, dedup by id
        const ids = new Set(pending.map(w => w.id));
        const merged = [...pending, ...dbPending.filter(w => !ids.has(w.id))];
        setWorkers(merged);
        setLoading(false);
      })
      .catch(() => {
        setWorkers(pending);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) fetchPendingWorkers();
  }, [isAuthenticated]);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleApprove = (workerId: string) => {
    const localWorkers: PendingWorker[] = JSON.parse(localStorage.getItem('local_workers') || '[]');
    const updated = localWorkers.map(w => w.id === workerId ? { ...w, status: 'verified' } : w);
    localStorage.setItem('local_workers', JSON.stringify(updated));

    // Also try Supabase
    supabase.from('workers').update({ status: 'verified' }).eq('id', workerId).then(() => {});

    setWorkers(prev => prev.filter(w => w.id !== workerId));
    setPreview(null);
    flash('✅ Worker approved and is now visible in search.');
  };

  const handleReject = (workerId: string) => {
    if (!window.confirm('Remove this worker from the platform? This cannot be undone.')) return;

    const localWorkers: PendingWorker[] = JSON.parse(localStorage.getItem('local_workers') || '[]');
    const filtered = localWorkers.filter(w => w.id !== workerId);
    localStorage.setItem('local_workers', JSON.stringify(filtered));

    // Also try Supabase
    supabase.from('workers').delete().eq('id', workerId).then(() => {});

    setWorkers(prev => prev.filter(w => w.id !== workerId));
    setPreview(null);
    flash('❌ Worker has been removed from the platform.');
  };

  // ── Admin Login Screen ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-300 flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Access</h1>
          <p className="text-gray-500 text-sm text-center mb-8">Connect Local — Admin Portal</p>

          {loginError && (
            <div className="bg-red-900/40 border border-red-700 text-red-400 text-sm p-3 rounded-lg mb-6">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Phone</label>
              <input
                type="tel"
                required
                value={loginPhone}
                onChange={e => setLoginPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Enter admin phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Connect Local</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to wipe all local test data? This will clear locally saved users and workers.')) {
                localStorage.removeItem('local_workers');
                localStorage.removeItem('local_users');
                await supabase.auth.signOut();
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Local Data
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Flash message */}
          {actionMsg && (
            <div className="mb-6 bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-medium text-gray-800 shadow-sm">
              {actionMsg}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
              <p className="text-sm text-gray-500 mt-0.5">Workers awaiting verification before appearing in search</p>
            </div>
            <span className="bg-amber-100 text-amber-700 font-bold text-sm px-3 py-1 rounded-full">
              {workers.length} pending
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading workers...
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">All clear!</h3>
              <p className="text-gray-500 text-sm">No workers are pending approval right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workers.map(worker => (
                <div key={worker.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div 
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setPreview(preview?.id === worker.id ? null : worker)}
                  >
                    {/* Avatar */}
                    <img
                      src={worker.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${worker.profiles?.full_name || 'W'}`}
                      alt={worker.profiles?.full_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shrink-0"
                    />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">{worker.profiles?.full_name || 'Unknown'}</h3>
                      <p className="text-primary font-medium text-sm">{worker.service_category}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        {(worker.street || worker.location_area) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {worker.street || worker.location_area}
                          </span>
                        )}
                        {worker.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {worker.contact_phone}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview(preview?.id === worker.id ? null : worker);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview profile"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(worker.id);
                        }}
                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(worker.id);
                        }}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        <ShieldX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Expandable Preview Panel */}
                  {preview?.id === worker.id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {worker.cover_image && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images of Previous Work</p>
                          <img src={worker.cover_image} alt="Cover" className="w-full h-40 object-cover rounded-xl" />
                        </div>
                      )}
                      {worker.bio && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
                          <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">{worker.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
