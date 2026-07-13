import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Upload, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const setRole = useAuthStore(state => state.setRole);
  const setUser = useAuthStore(state => state.setUser);
  
  // Step State
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    street: '',
    serviceCategory: 'Plumber',
    otherService: '',
    phone: '',
    openingHours: '',
    isAvailable: true,
    bio: '',
    specialties: '',
  });

  // Images (Stored locally as Blob URLs for demo)
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [nin, setNin] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleNext = () => {
    setError('');
    if (!formData.fullName || !formData.email || !formData.password || !formData.street || !formData.phone || !formData.bio) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!profileImage || !coverImage) {
      setError('Profile Picture and Cover Image are required.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Instead of DB insert, store in localStorage (local JSON)
        const finalService = formData.serviceCategory === 'Other' ? formData.otherService : formData.serviceCategory;
        const newWorker = {
          id: authData.user?.id || `local-${Date.now()}`,
          service_category: finalService || 'General',
          location_area: formData.street,
          street: formData.street,
          contact_phone: formData.phone,
          is_available: formData.isAvailable,
          profile_image: profileImage,
          cover_image: coverImage,
          bio: formData.bio,
          specialties: formData.specialties,
          status: 'unverified',
          trust_score: 80,
          recommended_by: 0,
          created_at: new Date().toISOString(),
          profiles: { full_name: formData.fullName }
        };

        const existingWorkers = JSON.parse(localStorage.getItem('local_workers') || '[]');
        existingWorkers.push(newWorker);
        localStorage.setItem('local_workers', JSON.stringify(existingWorkers));

        // Immediately update local auth store so routing doesn't blank out
        setUser(authData.user);
        setRole('worker');

        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>
      
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 mt-12 sm:mt-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join as a Professional</h2>
        <p className="text-gray-500 mb-8">Step {step} of 2: {step === 1 ? 'Personal & Business Info' : 'Verification & Images'}</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSignup} className="space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="test@dummy.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 pr-12" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street *</label>
                <input type="text" name="street" required value={formData.street} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="e.g. 12 Siluko Road" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Name (Optional)</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="John's Plumbing" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="0800 000 0000" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Services Offered *</label>
                <select name="serviceCategory" value={formData.serviceCategory} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50">
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Home Cleaning">Home Cleaning</option>
                  <option value="Barber / Hair Stylist">Barber / Hair Stylist</option>
                  <option value="Phone & Tech Repair">Phone & Tech Repair</option>
                  <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
                  <option value="Other">Other (Type below)</option>
                </select>
              </div>

              {formData.serviceCategory === 'Other' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Other Service *</label>
                  <input type="text" name="otherService" required value={formData.otherService} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="Specify service" />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Opening Hours (Optional)</label>
                <input type="text" name="openingHours" value={formData.openingHours} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="e.g. Mon-Sat, 8am-6pm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Specific Skills / Items you fix</label>
                <input type="text" name="specialties" value={formData.specialties} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="e.g. Pipe leaks, Wiring, Screen repair (comma separated)" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About Me *</label>
                <textarea 
                  name="bio" 
                  required 
                  value={formData.bio} 
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 min-h-[100px] resize-y" 
                  placeholder="Describe your experience, skills, and what makes you reliable..." 
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} className="w-5 h-5 text-primary rounded" />
                  <span className="font-bold text-gray-700">I am currently available for work</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors relative h-40 flex flex-col items-center justify-center">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-md" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Tap to upload face photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setProfileImage)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors relative h-40 flex flex-col items-center justify-center overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Tap to upload background</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setCoverImage)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </div>
                </div>
              </div>

              {/* Optional Verifications */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Trust & Verification (Optional)</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Business ID Upload (Optional)</label>
                    <div className="border border-gray-300 rounded-xl p-3 flex items-center justify-between bg-gray-50">
                      <span className="text-sm text-gray-500">{businessId ? 'File attached' : 'No file chosen'}</span>
                      <div className="relative">
                        <button type="button" className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700">Choose File</button>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleImageChange(e, setBusinessId)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">NIN (Optional)</label>
                    <input type="text" value={nin} onChange={(e) => setNin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50" placeholder="11-digit NIN" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 flex gap-4">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-colors">
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 active:scale-[0.98] ${loading ? 'opacity-70' : ''}`}
            >
              {step === 1 ? 'Continue' : loading ? 'Creating account...' : 'Complete Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
