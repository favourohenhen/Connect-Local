import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Search, MapPin, LogOut, Star, ArrowRight } from 'lucide-react';

export default function UserDashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [street, setStreet] = useState('');

  // Retrieve user info from localStorage
  const localUsers: any[] = JSON.parse(localStorage.getItem('local_users') || '[]');
  const currentUser = localUsers.find(u => u.id === user?.id);
  const displayName = currentUser?.full_name || 'Neighbour';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.append('service', service);
    if (street) params.append('street', street);
    navigate(`/search?${params.toString()}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  };

  const quickServices = [
    { name: 'Plumber', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Electrician', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Barber / Hair Stylist', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Home Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Carpenter', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Painting & Design', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h1 className="text-xl font-bold text-primary">Connect Local</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Welcome Card */}
          <div className="bg-primary rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Welcome back 👋</p>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-blue-100 text-sm mt-1">Find trusted workers right in your neighbourhood.</p>
          </div>

          {/* Search Bar */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Find a service</h3>
            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="What service do you need? (e.g. Plumber)"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center px-4 py-3">
                <MapPin className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <input
                  type="text"
                  list="dashboard-street-options"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Which street? (optional)"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
                <datalist id="dashboard-street-options">
                  <option value="Mechanic Road" />
                  <option value="Osakue Road" />
                  <option value="Opposite Urumwon Primary School" />
                  <option value="Idada Street" />
                  <option value="Groundnut Junction" />
                </datalist>
              </div>
              <div className="px-3 pb-3">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Search Professionals <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Access Services */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Popular services</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickServices.map((svc) => (
                <Link
                  key={svc.name}
                  to={`/search?service=${encodeURIComponent(svc.name)}`}
                  className="group relative rounded-xl overflow-hidden h-[120px] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={svc.img}
                    alt={svc.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 w-full p-2 text-[11px] font-bold text-white leading-tight">
                    {svc.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA — View All */}
          <Link
            to="/search"
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-semibold py-4 rounded-2xl transition-all shadow-sm"
          >
            <Star className="w-5 h-5" />
            Browse all workers in Urumwon
          </Link>

        </div>
      </main>
    </div>
  );
}
