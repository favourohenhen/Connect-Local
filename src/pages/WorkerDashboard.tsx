import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, Save, X, Star, Users } from 'lucide-react';

export default function WorkerDashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [workerData, setWorkerData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    contact_phone: '',
    bio: '',
    street: '',
    service_category: '',
    is_available: true,
    profile_image: '',
    cover_image: '',
    specialties: '',
  });

  React.useEffect(() => {
    if (user) {
      fetchWorkerData();
    }
  }, [user]);

  const fetchWorkerData = async () => {
    try {
      // Check local storage first
      const localWorkers = JSON.parse(localStorage.getItem('local_workers') || '[]');
      const localWorker = localWorkers.find((w: any) => w.id === user?.id);
      
      if (localWorker) {
        setWorkerData(localWorker);
        setEditForm({
          contact_phone: localWorker.contact_phone || '',
          bio: localWorker.bio || '',
          street: localWorker.street || localWorker.location_area || '',
          service_category: localWorker.service_category || '',
          is_available: localWorker.is_available ?? true,
          profile_image: localWorker.profile_image || localWorker.profile_image_url || '',
          cover_image: localWorker.cover_image || '',
          specialties: localWorker.specialties || '',
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('workers')
        .select('*, profiles!workers_id_fkey(full_name)')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        setWorkerData(data);
        setEditForm({
          contact_phone: data.contact_phone || '',
          bio: data.bio || '',
          street: data.location_area || '',
          service_category: data.service_category || '',
          is_available: data.is_available ?? true,
          profile_image: data.profile_image_url || '',
          cover_image: data.cover_image || '',
          specialties: data.specialties || '',
        });
      }
    } catch (err) {
      console.error('Error fetching worker data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      const updatePayload = {
        contact_phone: editForm.contact_phone,
        location_area: editForm.street,
        street: editForm.street,
        bio: editForm.bio,
        service_category: editForm.service_category,
        is_available: editForm.is_available,
        profile_image: editForm.profile_image,
        cover_image: editForm.cover_image,
        specialties: editForm.specialties
      };
      
      // Update local storage if present
      const localWorkers = JSON.parse(localStorage.getItem('local_workers') || '[]');
      const index = localWorkers.findIndex((w: any) => w.id === user?.id);
      if (index !== -1) {
        localWorkers[index] = { ...localWorkers[index], ...updatePayload };
        localStorage.setItem('local_workers', JSON.stringify(localWorkers));
      } else {
        // Fallback to Supabase if not locally stored
        await supabase.from('workers').update({
          contact_phone: editForm.contact_phone,
          location_area: editForm.street,
          service_category: editForm.service_category,
          is_available: editForm.is_available
        }).eq('id', user?.id);
      }
      
      setWorkerData({ ...workerData, ...editForm, location_area: editForm.street });
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const localWorkers = JSON.parse(localStorage.getItem('local_workers') || '[]');
      const filtered = localWorkers.filter((w: any) => w.id !== user?.id);
      localStorage.setItem('local_workers', JSON.stringify(filtered));
      handleLogout();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setEditForm(prev => ({ ...prev, [fieldName]: url }));
    }
  };

  // Completion calculation
  const missingFields: string[] = [];
  if (!workerData?.profiles?.full_name) missingFields.push('Full Name');
  if (!workerData?.service_category) missingFields.push('Service Category');
  if (!workerData?.contact_phone) missingFields.push('Phone Number');
  if (!workerData?.street && !workerData?.location_area) missingFields.push('Street');
  if (!workerData?.bio) missingFields.push('Bio');
  if (!workerData?.profile_image && !workerData?.profile_image_url) missingFields.push('Profile Image');
  if (!workerData?.cover_image) missingFields.push('Cover Image');
  
  const completionPercentage = Math.round(((7 - missingFields.length) / 7) * 100);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h1 className="text-xl font-bold text-primary">Worker Dashboard</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {workerData?.profiles?.full_name || 'Professional'}!</h2>
              <p className="text-gray-500">Manage your profile and services.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <Star className={`w-5 h-5 ${completionPercentage === 100 ? 'text-green-500' : 'text-yellow-400'} fill-current`} />
                  <span className="font-bold text-gray-900">{completionPercentage}% Profile Completion</span>
                </div>
                {missingFields.length > 0 && (
                  <span className="text-xs text-red-500 font-medium">Missing: {missingFields.join(', ')}</span>
                )}
                {completionPercentage === 100 && (
                  <span className="text-xs text-green-500 font-medium">Visible in search!</span>
                )}
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-900">{workerData?.recommended_by || 0} Recommendations</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
               {!editMode ? (
                 <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                   <Edit2 className="w-4 h-4" /> Edit Profile
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                     <X className="w-4 h-4" /> Cancel
                   </button>
                   <button onClick={handleSave} className="flex items-center gap-1 text-white font-medium px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors">
                     <Save className="w-4 h-4" /> Save
                   </button>
                 </div>
               )}
             </div>

             {editMode ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Service Category</label>
                   <input type="text" name="service_category" value={editForm.service_category} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                   <input type="tel" name="contact_phone" value={editForm.contact_phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Street</label>
                   <input type="text" name="street" value={editForm.street} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image Upload</label>
                   <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'profile_image')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
                   {editForm.profile_image && <img src={editForm.profile_image} className="mt-2 w-16 h-16 rounded-full object-cover" alt="Profile Preview" />}
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image Upload</label>
                   <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'cover_image')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
                   {editForm.cover_image && <img src={editForm.cover_image} className="mt-2 w-full h-16 rounded-xl object-cover" alt="Cover Preview" />}
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-bold text-gray-700 mb-2">Specific Skills / Items you fix</label>
                   <input type="text" name="specialties" value={editForm.specialties} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Pipe leaks, Wiring, Screen repair (comma separated)" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About Me</label>
                   <textarea name="bio" value={editForm.bio} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" />
                 </div>
                 <div className="md:col-span-2 flex items-center gap-3">
                   <input type="checkbox" name="is_available" checked={editForm.is_available} onChange={handleInputChange} className="w-5 h-5 text-primary rounded" />
                   <label className="font-bold text-gray-700">I am currently available for work</label>
                 </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                 <div>
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Category</span>
                   <p className="font-medium text-lg">{workerData?.service_category || 'Not specified'}</p>
                 </div>
                 <div>
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</span>
                   <p className="font-medium text-lg">{workerData?.contact_phone || 'Not specified'}</p>
                 </div>
                 <div>
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Street</span>
                   <p className="font-medium text-lg">{workerData?.street || 'Not specified'}</p>
                 </div>
                 <div>
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                   <p className="font-medium text-lg">
                     {workerData?.is_available ? (
                       <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-bold">Available</span>
                     ) : (
                       <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm font-bold">Busy</span>
                     )}
                   </p>
                 </div>
                 <div className="md:col-span-2 border-t border-gray-100 pt-4">
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bio / About Me</span>
                   <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{workerData?.bio || 'No bio provided.'}</p>
                 </div>
                 <div className="md:col-span-2">
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Specialties & Skills</span>
                   <div className="flex flex-wrap gap-2">
                     {workerData?.specialties ? workerData.specialties.split(',').map((s: string, i: number) => (
                       <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{s.trim()}</span>
                     )) : (
                       <span className="text-gray-500 text-sm">No specific skills listed.</span>
                     )}
                   </div>
                 </div>
                 <div className="md:col-span-2 border-t border-gray-100 pt-4 flex gap-4">
                   <div className="flex-1">
                     <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Profile Image</span>
                     {workerData?.profile_image || workerData?.profile_image_url ? (
                       <img src={workerData.profile_image || workerData.profile_image_url} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm" />
                     ) : (
                       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">None</div>
                     )}
                   </div>
                   <div className="flex-1">
                     <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Image</span>
                     {workerData?.cover_image ? (
                       <img src={workerData.cover_image} alt="Cover" className="w-full h-20 rounded-xl object-cover shadow-sm" />
                     ) : (
                       <div className="w-full h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">None</div>
                     )}
                   </div>
                 </div>
               </div>
             )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 mt-6">
             <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
             <p className="text-gray-500 text-sm mb-4">Permanently delete your profile from Connect Local. This action cannot be undone.</p>
             <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors">
               Delete My Account
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
