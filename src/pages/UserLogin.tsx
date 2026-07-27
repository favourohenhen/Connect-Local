import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';

export default function UserLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setRole = useAuthStore(state => state.setRole);
  const setUser = useAuthStore(state => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length !== 11) {
      setError('Phone number must be exactly 11 digits.');
      return;
    }

    setLoading(true);

    const placeholderEmail = `${phone.replace(/\s+/g, '')}@connectlocal.app`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: placeholderEmail,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        setRole(profileData?.role || 'customer');
        setUser(authData.user);
        navigate('/user/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    if (numericValue.length > 0 && numericValue.length !== 11) {
      setPhoneError('Phone number must be exactly 11 digits (e.g. 08012345678).');
    } else {
      setPhoneError('');
    }
    setPhone(numericValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 mt-10 sm:mt-0">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back, Neighbour</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Log in to your community account</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border ${phoneError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                placeholder="e.g. 08012345678"
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-full transition-colors disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/user/signup" className="text-primary font-medium hover:underline">
            Sign up here
          </Link>
        </p>
        <p className="text-center mt-3 text-gray-600 text-sm">
          Are you a service professional?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Worker login
          </Link>
        </p>
      </div>
    </div>
  );
}
