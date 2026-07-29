import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, ArrowLeft, Phone, User, MapPin, ShieldCheck } from 'lucide-react';

export default function UserSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/search';
  
  const setRole = useAuthStore(state => state.setRole);
  const setUser = useAuthStore(state => state.setUser);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 0 && numericValue.length !== 11) {
        setPhoneError('Phone number must be exactly 11 digits (e.g. 08012345678).');
      } else {
        setPhoneError('');
      }
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generatePassword = () => {
    const words = ['Lion', 'Blue', 'Fast', 'Tree', 'Moon', 'Gold', 'Star', 'Safe'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const pass = `${word}${num}!`;
    setFormData(prev => ({ ...prev, password: pass }));
    setShowPassword(false);
  };

  const isStrongPassword = (pw: string) => {
    // Requires at least 8 chars, 1 letter, 1 number, and only printable ASCII (no emojis)
    return /^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/.test(pw);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.phone || !formData.street || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.phone.length !== 11) {
      setError('Phone number must be exactly 11 digits.');
      return;
    }
    
    if (!isStrongPassword(formData.password)) {
      setError('Password must be at least 8 characters, contain letters and numbers, and cannot include emojis.');
      return;
    }

    setLoading(true);

    const placeholderEmail = `${formData.phone.replace(/\s+/g, '')}@connectlocal.app`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: placeholderEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: formData.fullName,
          phone_number: formData.phone,
          role: 'customer'
        });

        if (profileError) {
          console.error('Failed to insert profile:', profileError);
          throw profileError;
        }

        setUser(authData.user);
        setRole('customer');

        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 mt-10 sm:mt-0">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Join the Community</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Create your free account to recommend trusted workers</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. Osas Edosa"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                maxLength={11}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border ${phoneError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                placeholder="e.g. 08012345678"
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="street"
                list="user-street-options"
                required
                value={formData.street}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. Mechanic Road"
              />
              <datalist id="user-street-options">
                <option value="Mechanic Road" />
                <option value="Osakue Road" />
                <option value="Opposite Urumwon Primary School" />
                <option value="Idada Street" />
                <option value="Groundnut Junction" />
              </datalist>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <button 
                type="button" 
                onClick={generatePassword}
                className="text-xs text-primary hover:text-primary-dark font-medium"
              >
                Suggest strong password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="At least 8 chars, letters & numbers"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              You'll stay logged in securely until you manually log out.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-full transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/user/login" className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
        <p className="text-center mt-3 text-gray-600 text-sm">
          Want to offer a service?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Join as a Worker
          </Link>
        </p>
      </div>
    </div>
  );
}
