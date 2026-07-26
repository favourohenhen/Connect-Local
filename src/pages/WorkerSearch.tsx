import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowLeft, Phone, Star, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface WorkerSummary {
  id: string;
  service_category: string;
  location_area: string;
  street?: string;
  status: string;
  trust_score: number;
  is_available: boolean;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  recommended_by?: number;
  contact_phone?: string;
  specialties?: string;
  created_at?: string;
  profiles?: {
    full_name: string;
  };
}

export interface LocalJob {
  id: string;
  user_id: string;
  worker_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface LocalReview {
  id: string;
  job_id: string;
  user_id: string;
  worker_id: string;
  rating: 5 | 3 | 1;
  tags: string[];
  would_rehire: boolean;
  created_at: string;
}


export default function WorkerSearch() {
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { role, user } = useAuthStore();
  const isCustomer = role === 'customer';
  const homeLink = isCustomer ? '/user/dashboard' : '/';
  const navigate = useNavigate();

  const [searchService, setSearchService] = useState(params.get('service') || '');
  const [searchStreet, setSearchStreet] = useState(params.get('street') || '');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedWorker, setSelectedWorker] = useState<WorkerSummary | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Job & Review State
  const [currentJob, setCurrentJob] = useState<LocalJob | null>(null);
  const [currentReview, setCurrentReview] = useState<LocalReview | null>(null);
  const [allReviews, setAllReviews] = useState<LocalReview[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<Partial<LocalReview>>({ tags: [] });
  const [reviewStep, setReviewStep] = useState(1);

  // Load active job and review when worker is selected
  useEffect(() => {
    async function loadJobAndReview() {
      if (selectedWorker && user) {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('worker_id', selectedWorker.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (jobs && jobs.length > 0) {
          setCurrentJob(jobs[0]);
          const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('job_id', jobs[0].id)
            .single();
          setCurrentReview(reviews || null);
        } else {
          setCurrentJob(null);
          setCurrentReview(null);
        }
      } else {
        setCurrentJob(null);
        setCurrentReview(null);
      }
    }
    loadJobAndReview();
  }, [selectedWorker, user]);

  const handleCallClick = async (phone?: string, workerId?: string) => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
      
      if (user && workerId && !currentJob) {
        // Rate limiting check
        const { data: recentJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());
          
        if (recentJobs && recentJobs.length >= 3) {
          alert("You've contacted too many workers recently. Please wait before contacting more.");
          return;
        }

        const { data, error } = await supabase
          .from('jobs')
          .insert({
            user_id: user.id,
            worker_id: workerId,
            status: 'pending'
          })
          .select()
          .single();

        if (data && !error) {
          setCurrentJob(data);
        }
      } else if (!user) {
        setShowLoginPrompt(true);
      }
    }
  };

  const handleConfirmJob = async (didComplete: boolean) => {
    if (!currentJob) return;
    const newStatus = didComplete ? 'completed' : 'failed';
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', currentJob.id)
      .select()
      .single();

    if (data && !error) {
      setCurrentJob(data);
    }
  };

  const handleSubmitReview = async (finalDraft: Partial<LocalReview>) => {
    if (!currentJob || !user || !selectedWorker) return;
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        job_id: currentJob.id,
        user_id: user.id,
        worker_id: selectedWorker.id,
        rating: finalDraft.rating,
        tags: finalDraft.tags || [],
        would_rehire: finalDraft.would_rehire || false
      })
      .select()
      .single();

    if (data && !error) {
      setCurrentReview(data);
      setAllReviews([...allReviews, data]);
    }
    setShowReviewModal(false);
  };

  const getWorkerStats = (workerId: string) => {
    const workerReviews = allReviews.filter(r => r.worker_id === workerId);
    const w = workers.find(w => w.id === workerId);
    
    if (workerReviews.length === 0) {
       return { 
         rating: 0, 
         recommends: w?.recommended_by || 0,
         good: 0, okay: 0, bad: 0,
         tags: [] as string[]
       };
    }
    
    let sum = 0, good = 0, okay = 0, bad = 0;
    const tagCounts: Record<string, number> = {};
    let recommends = w?.recommended_by || 0;
    
    workerReviews.forEach(r => {
      sum += r.rating;
      if (r.rating === 5) good++;
      else if (r.rating === 3) okay++;
      else bad++;
      
      if (r.would_rehire) recommends++;
      r.tags?.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });
    
    const tags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).map(e => e[0]);
    
    return {
       rating: (sum / workerReviews.length).toFixed(1),
       recommends,
       good, okay, bad,
       tags
    };
  };

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const serviceParam = currentParams.get('service');
    const streetParam = currentParams.get('street');
    if (serviceParam !== null && serviceParam !== searchService) {
      setSearchService(serviceParam);
    }
    if (streetParam !== null && streetParam !== searchStreet) {
      setSearchStreet(streetParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchWorkers(searchService, searchStreet);
  }, [searchService, searchStreet]);

  const fetchWorkers = async (serviceTerm = '', streetTerm = '') => {
    setLoading(true);
    try {
      let query = supabase.from('workers').select('id, service_category, location_area, street, status, trust_score, is_available, created_at, bio, profile_image_url, cover_image, recommended_by, contact_phone, specialties, profiles!workers_id_fkey(full_name)');

      if (serviceTerm) {
        query = query.ilike('service_category', `%${serviceTerm}%`);
      }
      if (streetTerm) {
        query = query.or(`location_area.ilike.%${streetTerm}%,street.ilike.%${streetTerm}%`);
      }

      const [{ data: workersData }, { data: reviewsData }] = await Promise.all([
        query,
        supabase.from('reviews').select('*')
      ]);

      if (reviewsData) setAllReviews(reviewsData);

      const isProfileComplete = (worker: any) => {
        let count = 0;
        if (worker.profiles?.full_name) count++;
        if (worker.service_category) count++;
        if (worker.contact_phone) count++;
        if (worker.street || worker.location_area) count++;
        if (worker.bio) count++;
        if (worker.profile_image_url || worker.profile_image) count++; // Handle Supabase standard fields
        if (worker.cover_image) count++;
        return count === 7;
      };

      const dbWorkers = (workersData as any[]) || [];
      const completeDbWorkers = dbWorkers.map(w => ({
        ...w,
        profile_image: w.profile_image_url // normalize image field
      })).filter(isProfileComplete);

      setWorkers(completeDbWorkers);
    } catch (err) {
      console.error(err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const openModal = (worker: WorkerSummary) => {
    setSelectedWorker(worker);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedWorker(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to={homeLink} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to={homeLink} className="text-xl font-bold text-primary hidden sm:block">Connect Local</Link>
        </div>
      </header>

      <div className="flex-1 p-4 w-full max-w-6xl mx-auto">
        <div className="mb-6 mt-2 md:mt-4 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Find trusted services in your community</h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto md:mx-0">Search for verified local professionals, read community recommendations, and connect with the right person for the job.</p>
        </div>
        <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row gap-2 bg-white p-2 rounded-2xl md:rounded-full shadow-sm border border-gray-200">
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
            <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="E.g. Plumber, Barber..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-2">
            <MapPin className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
            <input
              type="text"
              list="street-options"
              placeholder="Filter by Street (e.g. Mechanic Road)"
              value={searchStreet}
              onChange={(e) => setSearchStreet(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
            <datalist id="street-options">
              <option value="Mechanic Road" />
              <option value="Osakue Road" />
              <option value="Opposite Urumwon Primary School" />
              <option value="Idada Street" />
              <option value="Groundnut Junction" />
            </datalist>
          </div>
          <button type="button" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl md:rounded-full font-medium transition-colors w-full md:w-auto">
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading professionals...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                onClick={() => openModal(worker)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="h-32 bg-gray-200 relative overflow-hidden shrink-0">
                  {worker.created_at && (new Date().getTime() - new Date(worker.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                    <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-md tracking-wider">
                      NEW
                    </div>
                  )}
                  {worker.cover_image ? (
                    <img src={worker.cover_image} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {worker.is_available ? (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">AVAILABLE</div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">BUSY</div>
                  )}
                </div>

                <div className="p-5 relative flex-1 flex flex-col">
                  <div className="absolute -top-10 left-5">
                    <img
                      src={worker.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${worker.profiles?.full_name}`}
                      alt={worker.profiles?.full_name}
                      className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm bg-white"
                    />
                  </div>

                  <div className="mt-10 mb-2">
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-xl text-gray-900">{worker.profiles?.full_name}</h3>
                      {worker.status === 'verified' && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-primary font-medium">{worker.service_category}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {worker.bio || 'Professional service provider in Urumwon.'}
                  </p>

                  {worker.specialties && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {worker.specialties.split(',').slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{s.trim()}</span>
                      ))}
                      {worker.specialties.split(',').length > 2 && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded-md">+{worker.specialties.split(',').length - 2}</span>}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{worker.street || worker.location_area}</span>
                    </div>
                    <div className="flex items-center justify-center bg-blue-50/50 p-2 rounded-lg border border-blue-100 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{worker.recommended_by || 0} Recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-primary border border-gray-200 py-3 rounded-xl font-bold transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      if (worker.contact_phone) window.location.href = `tel:${worker.contact_phone}`;
                    }}
                  >
                    <Phone className="w-5 h-5" /> Call Now
                  </button>
                </div>
              </div>
            ))}

            {workers.length === 0 && (
              <div className="col-span-full text-center bg-white p-12 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No professionals found</h3>
                <p className="text-gray-500">Try adjusting your filters or searching for another service.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="w-full sm:max-w-md flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-48 shrink-0">
                <img src={selectedWorker.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&fit=crop'} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <button
                  onClick={closeModal}
                  className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="relative pt-32 px-4 pb-4 flex-1 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                  <div className="absolute -top-12 left-6">
                    <img
                      src={selectedWorker.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedWorker.profiles?.full_name}`}
                      alt={selectedWorker.profiles?.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
                    />
                  </div>

                  <div className="mb-6 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedWorker.profiles?.full_name}
                      {selectedWorker.status === 'verified' && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                    </h2>
                    <p className="text-primary font-medium text-lg">{selectedWorker.service_category}</p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {selectedWorker.street || selectedWorker.location_area}
                    </p>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="bg-gray-50 flex-1 p-3 rounded-xl border border-gray-100 text-center">
                      <div className="h-8 flex justify-center items-center">
                        {selectedWorker.status === 'verified' ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <span className="text-gray-400 font-bold">---</span>}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                        {selectedWorker.status === 'verified' ? 'Verified Pro' : 'Unverified'}
                      </div>
                    </div>
                    <div className="bg-blue-50 flex-1 p-3 rounded-xl border border-blue-100 text-center">
                      <div className="h-8 flex justify-center items-center gap-1 text-2xl font-bold text-blue-700">
                        <Star className="w-5 h-5 fill-current" />
                        {(() => {
                           const stats = getWorkerStats(selectedWorker.id);
                           return stats.recommends;
                        })()}
                      </div>
                      <div className="text-xs text-blue-600 uppercase font-bold tracking-wide mt-1">Recommendations</div>
                    </div>
                  </div>

                  {/* Job & Review Flow */}
                  {showLoginPrompt ? (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <p className="text-amber-800 font-medium text-sm mb-3">Log in to track jobs and leave reviews</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { setShowLoginPrompt(false); navigate('/user/login'); }}
                          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => setShowLoginPrompt(false)}
                          className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : currentJob?.status === 'pending' ? (
                     <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center shadow-sm animate-in fade-in duration-300">
                       <h3 className="font-bold text-blue-900 mb-1 text-lg">Did this person do the job?</h3>
                       <p className="text-sm text-blue-700 mb-4 opacity-80">You recently contacted them for service.</p>
                       <div className="flex gap-3 justify-center">
                         <button onClick={() => handleConfirmJob(true)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"><CheckCircle2 className="w-5 h-5"/> Yes</button>
                         <button onClick={() => handleConfirmJob(false)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"><XCircle className="w-5 h-5"/> No</button>
                       </div>
                     </div>
                  ) : currentJob?.status === 'completed' && !currentReview ? (
                     <button onClick={() => { setShowReviewModal(true); setReviewStep(1); setReviewDraft({ tags: [] }); }} className="w-full flex items-center justify-center gap-2 mb-6 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[15px] transition-all shadow-md active:scale-[0.98] animate-in slide-in-from-bottom-2">
                       <Star className="w-5 h-5 fill-current" /> Rate & Review Work
                     </button>
                  ) : currentJob?.status === 'failed' ? (
                     <div className="mb-6 bg-gray-100 border border-gray-200 rounded-xl p-4 text-center text-gray-600 font-medium text-sm">
                       Job marked as not completed.
                     </div>
                  ) : currentReview ? (
                     <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800 font-medium text-sm animate-in fade-in">
                       <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                       <div>You've reviewed this worker. Thanks for keeping the community safe!</div>
                     </div>
                  ) : null}

                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedWorker.bio || 'Professional service provider registered on Connect Local. Verified for quality and trust.'}
                    </p>
                  </div>

                  {selectedWorker.specialties && (
                    <div className="mb-8">
                      <h3 className="font-bold text-gray-900 mb-3">Specialties & Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorker.specialties.split(',').map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    {selectedWorker.is_available ? (
                      <a
                        href={`tel:${selectedWorker.contact_phone}`}
                        onClick={() => handleCallClick(selectedWorker.contact_phone, selectedWorker.id)}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                      >
                        <Phone className="w-6 h-6" />
                        {copiedPhone ? 'Number Copied!' : (selectedWorker.contact_phone ? `Call ${selectedWorker.contact_phone}` : 'Call Directly')}
                      </a>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-4 rounded-full font-bold text-lg cursor-not-allowed">
                        Currently Busy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tap-Only Review Modal Overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center leading-tight">
                {reviewStep === 1 && "How was the service?"}
                {reviewStep === 2 && "What stood out?"}
                {reviewStep === 3 && "Final Question"}
              </h3>
              
              {reviewStep === 1 && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setReviewDraft(p => ({...p, rating: 5})); setReviewStep(2); }} className="w-full flex items-center gap-5 bg-green-50 hover:bg-green-100 p-5 rounded-2xl transition-all active:scale-[0.98]">
                    <span className="text-4xl leading-none">👍</span> <span className="font-bold text-green-900 text-xl">Good</span>
                  </button>
                  <button onClick={() => { setReviewDraft(p => ({...p, rating: 3})); setReviewStep(2); }} className="w-full flex items-center gap-5 bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all active:scale-[0.98]">
                    <span className="text-4xl leading-none">😐</span> <span className="font-bold text-gray-900 text-xl">Okay</span>
                  </button>
                  <button onClick={() => { setReviewDraft(p => ({...p, rating: 1})); setReviewStep(2); }} className="w-full flex items-center gap-5 bg-red-50 hover:bg-red-100 p-5 rounded-2xl transition-all active:scale-[0.98]">
                    <span className="text-4xl leading-none">👎</span> <span className="font-bold text-red-900 text-xl">Bad</span>
                  </button>
                </div>
              )}
              
              {reviewStep === 2 && (
                <div className="animate-in slide-in-from-right-4">
                  <div className="flex flex-wrap gap-2.5 mb-8 justify-center">
                    {['🛠️ Good work', '😊 Respectful', '⏱️ Fast', '💰 Fair price'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => {
                          const tags = reviewDraft.tags || [];
                          if (tags.includes(tag)) setReviewDraft(p => ({...p, tags: tags.filter(t => t !== tag)}));
                          else setReviewDraft(p => ({...p, tags: [...tags, tag]}));
                        }}
                        className={`px-5 py-3 rounded-full font-bold text-[15px] border-2 transition-all active:scale-95 ${reviewDraft.tags?.includes(tag) ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setReviewStep(3)} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl text-lg transition-all shadow-md active:scale-[0.98]">Continue</button>
                </div>
              )}
              
              {reviewStep === 3 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4">
                  <p className="text-center font-medium text-gray-600 text-lg">Would you call this worker again for future jobs?</p>
                  <div className="flex gap-4">
                    <button onClick={() => { const final = {...reviewDraft, would_rehire: true}; setReviewDraft(final); handleSubmitReview(final); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-md shadow-green-500/20">Yes</button>
                    <button onClick={() => { const final = {...reviewDraft, would_rehire: false}; setReviewDraft(final); handleSubmitReview(final); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-2xl text-lg transition-all active:scale-95">No</button>
                  </div>
                </div>
              )}
            </div>
            {/* Close Button */}
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"><XCircle className="w-6 h-6"/></button>
          </div>
        </div>
      )}
    </div>
  );
}
