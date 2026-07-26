import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldX, ArrowLeft, Phone, MapPin, LogOut, Eye, RefreshCw, XCircle } from 'lucide-react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PendingWorker | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone === ADMIN_PHONE && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid admin credentials.');
    }
  };

  const fetchPendingWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers')
      .select('*, profiles!workers_id_fkey(full_name)')
      .eq('status', 'unverified');
    
    if (data && !error) {
      setWorkers((data as unknown as PendingWorker[]) || []);
    } else {
      console.error('Failed to fetch pending workers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchPendingWorkers();
  }, [isAuthenticated]);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleApprove = async (workerId: string) => {
    const { error } = await supabase.from('workers').update({ status: 'verified' }).eq('id', workerId);
    if (!error) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setPreview(null);
      flash('✅ Worker approved and is now visible in search.');
    } else {
      flash('❌ Error approving worker.');
    }
  };

  const handleReject = async (workerId: string) => {
    if (!window.confirm('Remove this worker from the platform? This cannot be undone.')) return;

    const { error } = await supabase.from('workers').delete().eq('id', workerId);
    if (!error) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setPreview(null);
      flash('❌ Worker has been removed from the platform.');
    } else {
      flash('❌ Error rejecting worker.');
    }
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

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Admin Worker Review Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div
            className="w-full sm:max-w-md flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col">
              <div 
                className="absolute top-0 left-0 right-0 h-48 shrink-0 bg-gray-200 group cursor-pointer"
                onClick={() => setFullscreenImage(preview.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&fit=crop')}
              >
                <img src={preview.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&fit=crop'} alt="Cover" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="relative pt-32 px-4 pb-4 flex-1 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                  <div 
                    className="absolute -top-12 left-6 cursor-pointer group"
                    onClick={() => setFullscreenImage(preview.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${preview.profiles?.full_name}`)}
                  >
                    <img
                      src={preview.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${preview.profiles?.full_name}`}
                      alt={preview.profiles?.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="mb-6 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {preview.profiles?.full_name}
                      {preview.status === 'verified' && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                    </h2>
                    <p className="text-primary font-medium text-lg">{preview.service_category}</p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                      <MapPin className="w-4 h-4" /> {preview.street || preview.location_area || 'Urumwon'}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {preview.bio || 'Professional service provider registered on Connect Local.'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                     <button
                        onClick={() => handleApprove(preview.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3.5 rounded-xl text-lg transition-all active:scale-95 border border-green-200 shadow-sm"
                      >
                        <ShieldCheck className="w-5 h-5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(preview.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl text-lg transition-all active:scale-95 border border-red-200 shadow-sm"
                      >
                        <ShieldX className="w-5 h-5" /> Reject
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            <XCircle className="w-8 h-8" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
}
