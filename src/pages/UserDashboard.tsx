import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Search, MapPin, LogOut, Star, ArrowRight, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, ShieldCheck, ArrowLeft } from 'lucide-react';
import { DUMMY_WORKERS } from './WorkerSearch';

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

  const [myJobs, setMyJobs] = useState<LocalJob[]>([]);
  const [myReviews, setMyReviews] = useState<LocalReview[]>([]);
  const [workerDetails, setWorkerDetails] = useState<Record<string, any>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeJobId, setActiveJobId] = useState('');
  const [activeWorkerId, setActiveWorkerId] = useState('');
  const [reviewStep, setReviewStep] = useState(1);
  const [reviewDraft, setReviewDraft] = useState<Partial<LocalReview>>({ tags: [] });
  const [selectedWorkerForModal, setSelectedWorkerForModal] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const jobs: LocalJob[] = JSON.parse(localStorage.getItem('local_jobs') || '[]');
      setMyJobs(jobs.filter(j => j.user_id === user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      const reviews: LocalReview[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
      setMyReviews(reviews.filter(r => r.user_id === user.id));
    }
  }, [user]);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (myJobs.length === 0) return;
      const workerIds = [...new Set(myJobs.map(j => j.worker_id))];
      
      const localWorkers: any[] = JSON.parse(localStorage.getItem('local_workers') || '[]');
      const details: Record<string, any> = {};
      
      const { data } = await supabase
        .from('workers')
        .select('*, profiles!workers_id_fkey(full_name)')
        .in('id', workerIds);
        
      if (data) {
        data.forEach(w => {
          details[w.id] = w;
        });
      }
      
      workerIds.forEach(id => {
        if (!details[id]) {
           const local = localWorkers.find(lw => lw.id === id) || DUMMY_WORKERS.find(dw => dw.id === id);
           if (local) {
             details[id] = local;
           }
        }
      });
      
      setWorkerDetails(details);
    };
    fetchWorkerDetails();
  }, [myJobs]);

  const handleConfirmJob = (jobId: string, didComplete: boolean) => {
    const jobs: LocalJob[] = JSON.parse(localStorage.getItem('local_jobs') || '[]');
    const jobIdx = jobs.findIndex(j => j.id === jobId);
    if (jobIdx !== -1) {
      jobs[jobIdx].status = didComplete ? 'completed' : 'failed';
      localStorage.setItem('local_jobs', JSON.stringify(jobs));
      setMyJobs(jobs.filter(j => j.user_id === user?.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

  const handleSubmitReview = (finalDraft: Partial<LocalReview>) => {
    if (!user) return;
    const reviews: LocalReview[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
    const newReview: LocalReview = {
      id: `rev-${Date.now()}`,
      job_id: activeJobId,
      user_id: user.id,
      worker_id: activeWorkerId,
      rating: finalDraft.rating as 5|3|1,
      tags: finalDraft.tags || [],
      would_rehire: finalDraft.would_rehire || false,
      created_at: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem('local_reviews', JSON.stringify(reviews));
    setMyReviews([...myReviews, newReview]);
    setShowReviewModal(false);
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

          {/* My Recent Jobs */}
          {myJobs.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">My Recent Jobs</h3>
              <div className="space-y-4">
                {myJobs.map(job => {
                  const hasReview = myReviews.some(r => r.job_id === job.id);
                  const workerInfo = workerDetails[job.worker_id];
                  const fullName = workerInfo?.profiles?.full_name || 'Service Pro';
                  const service = workerInfo?.service_category || 'Local Worker';
                  const avatarUrl = workerInfo?.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;

                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md">
                      <div 
                        className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors"
                        onClick={() => setSelectedWorkerForModal(workerInfo)}
                      >
                        <img src={avatarUrl} alt={fullName} className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover shrink-0 bg-white" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 leading-tight truncate">{fullName}</h4>
                          <p className="text-xs text-gray-500 mt-1 truncate">{service}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {job.status === 'pending' && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-3 text-center">Did the pro do the job?</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmJob(job.id, true)} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg text-sm">Yes</button>
                            <button onClick={() => handleConfirmJob(job.id, false)} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg text-sm">No</button>
                          </div>
                        </div>
                      )}

                      {job.status === 'completed' && !hasReview && (
                        <button 
                          onClick={() => { setActiveJobId(job.id); setActiveWorkerId(job.worker_id); setReviewStep(1); setReviewDraft({ tags: [] }); setShowReviewModal(true); }}
                          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4 fill-current" /> Leave a Review
                        </button>
                      )}

                      {job.status === 'completed' && hasReview && (
                        <div className="mt-2 text-sm text-green-700 bg-green-50 rounded-lg p-2 text-center font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Review submitted
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Access Services */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Popular services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Worker Details Modal Overlay */}
      {selectedWorkerForModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedWorkerForModal(null)}>
          <div
            className="w-full sm:max-w-md flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-48 shrink-0">
                <img src={selectedWorkerForModal.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&fit=crop'} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <button
                  onClick={() => setSelectedWorkerForModal(null)}
                  className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="relative pt-32 px-4 pb-4 flex-1 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                  <div className="absolute -top-12 left-6">
                    <img
                      src={selectedWorkerForModal.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedWorkerForModal.profiles?.full_name}`}
                      alt={selectedWorkerForModal.profiles?.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
                    />
                  </div>

                  <div className="mb-6 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedWorkerForModal.profiles?.full_name}
                      {selectedWorkerForModal.status === 'verified' && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                    </h2>
                    <p className="text-primary font-medium text-lg">{selectedWorkerForModal.service_category}</p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {selectedWorkerForModal.street || selectedWorkerForModal.location_area || 'Urumwon'}
                    </p>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="bg-gray-50 flex-1 p-3 rounded-xl border border-gray-100 text-center">
                      <div className="h-8 flex justify-center items-center">
                        {selectedWorkerForModal.status === 'verified' ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <span className="text-gray-400 font-bold">---</span>}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                        {selectedWorkerForModal.status === 'verified' ? 'Verified Pro' : 'Unverified'}
                      </div>
                    </div>
                    <div className="bg-blue-50 flex-1 p-3 rounded-xl border border-blue-100 text-center">
                      <div className="h-8 flex justify-center items-center gap-1 text-2xl font-bold text-blue-700">
                        <Star className="w-5 h-5 fill-current" />
                        {(() => {
                           const reviews: LocalReview[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
                           const workerReviews = reviews.filter(r => r.worker_id === selectedWorkerForModal.id && r.would_rehire);
                           return (selectedWorkerForModal.recommended_by || 0) + workerReviews.length;
                        })()}
                      </div>
                      <div className="text-xs text-blue-600 uppercase font-bold tracking-wide mt-1">Recommendations</div>
                    </div>
                  </div>

                  {/* Job & Review Flow inside Modal */}
                  {(() => {
                    const currentJob = myJobs.find(j => j.worker_id === selectedWorkerForModal.id);
                    const currentReview = myReviews.find(r => r.job_id === currentJob?.id);
                    
                    return currentJob?.status === 'pending' ? (
                     <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center shadow-sm animate-in fade-in duration-300">
                       <h3 className="font-bold text-blue-900 mb-1 text-lg">Did this person do the job?</h3>
                       <p className="text-sm text-blue-700 mb-4 opacity-80">You recently contacted them for service.</p>
                       <div className="flex gap-3 justify-center">
                         <button onClick={() => handleConfirmJob(currentJob.id, true)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"><CheckCircle2 className="w-5 h-5"/> Yes</button>
                         <button onClick={() => handleConfirmJob(currentJob.id, false)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"><XCircle className="w-5 h-5"/> No</button>
                       </div>
                     </div>
                  ) : currentJob?.status === 'completed' && !currentReview ? (
                     <button onClick={() => { setActiveJobId(currentJob.id); setActiveWorkerId(currentJob.worker_id); setShowReviewModal(true); setReviewStep(1); setReviewDraft({ tags: [] }); }} className="w-full flex items-center justify-center gap-2 mb-6 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[15px] transition-all shadow-md active:scale-[0.98] animate-in slide-in-from-bottom-2">
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
                  ) : null;
                  })()}

                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedWorkerForModal.bio || 'Professional service provider registered on Connect Local. Verified for quality and trust.'}
                    </p>
                  </div>

                  {selectedWorkerForModal.specialties && (
                    <div className="mb-8">
                      <h3 className="font-bold text-gray-900 mb-3">Specialties & Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkerForModal.specialties.split(',').map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    {selectedWorkerForModal.is_available ? (
                      <a
                        href={`tel:${selectedWorkerForModal.contact_phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                      >
                        Call {selectedWorkerForModal.contact_phone}
                      </a>
                    ) : (
                      <button disabled className="w-full py-4 bg-gray-200 text-gray-500 rounded-full font-bold text-lg cursor-not-allowed">
                        Currently Unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
