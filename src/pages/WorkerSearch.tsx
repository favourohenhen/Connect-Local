import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, ArrowLeft, Phone, Star, ShieldCheck } from 'lucide-react';

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

const DUMMY_WORKERS: WorkerSummary[] = [
  {
    id: 'dummy-1',
    service_category: 'Plumber',
    location_area: 'Urumwon',
    street: 'Mechanic Road',
    status: 'verified',
    trust_score: 98,
    is_available: true,
    bio: 'Expert in pipe fixing, leakages, and full bathroom plumbing installations with over 10 years of local experience.',
    profile_image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=400&fit=crop',
    recommended_by: 14,
    contact_phone: '+2348000000001',
    specialties: 'Pipe Repair, Installations, Leakage Detection',
    profiles: { full_name: 'Osaze Ighodaro' }
  },
  {
    id: 'dummy-2',
    service_category: 'Electrician',
    location_area: 'Urumwon',
    street: 'Osakue Road',
    status: 'verified',
    trust_score: 95,
    is_available: false,
    bio: 'Professional house wiring, fault tracing, and generator repairs. Quick response guaranteed.',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=400&fit=crop',
    recommended_by: 22,
    contact_phone: '+2348000000002',
    specialties: 'House Wiring, Generator Repair, Fault Tracing',
    profiles: { full_name: 'Nosa Edosa' }
  },
  {
    id: 'dummy-3',
    service_category: 'Barber / Hair Stylist',
    location_area: 'Urhumwon',
    street: ' Opppostie Urhumwon Primary School',
    status: 'verified',
    trust_score: 99,
    is_available: true,
    bio: 'Clean fades, dreads locking, and general hair grooming. Home service available upon request.',
    profile_image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop',
    recommended_by: 45,
    contact_phone: '+2348000000003',
    specialties: 'Haircuts, Dreads, Grooming',
    profiles: { full_name: 'Precious Haircuts' }
  },
  {
    id: 'dummy-4',
    service_category: 'Home Cleaning',
    location_area: 'Urumwon',
    street: 'Idada Street',
    status: 'verified',
    trust_score: 92,
    is_available: true,
    bio: 'Deep house cleaning, post-construction cleaning, and general sanitation. Affordable and thorough.',
    profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop',
    recommended_by: 18,
    contact_phone: '+2348000000004',
    specialties: 'Deep Cleaning, Sanitation, Post-Construction',
    profiles: { full_name: 'Blessing Omoruyi' }
  },
  {
    id: 'dummy-5',
    service_category: 'Carpenter',
    location_area: 'Urumwon',
    street: 'Groundnut Junction',
    status: 'verified',
    trust_score: 94,
    is_available: true,
    bio: 'Roofing, furniture making, and repairs. Quality woodworks that last.',
    profile_image: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=400&fit=crop',
    recommended_by: 9,
    contact_phone: '+2348000000005',
    specialties: 'Roofing, Furniture, Woodwork',
    profiles: { full_name: 'Friday Woodworks' }
  },
  {
    id: 'dummy-6',
    service_category: 'Phone & Tech Repair',
    location_area: 'Urumwon',
    street: 'Mechanic Road',
    status: 'unverified',
    trust_score: 85,
    is_available: true,
    bio: 'Screen replacement, charging ports, and software flashing for all iPhone and Android models.',
    profile_image: 'https://images.unsplash.com/photo-1539331586018-346b53b2aaa4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?w=800&h=400&fit=crop',
    recommended_by: 31,
    contact_phone: '+2348000000006',
    specialties: 'Screen Replacement, Software, Repairs',
    profiles: { full_name: 'TechFix by Osas' }
  },
  {
    id: 'dummy-7',
    service_category: 'Laundry & Dry Cleaning',
    location_area: 'Urumwon',
    street: 'Osakue Road',
    status: 'verified',
    trust_score: 97,
    is_available: true,
    bio: 'Fast and reliable dry cleaning, ironing, and fabric care. Pick up and delivery available.',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=400&fit=crop',
    recommended_by: 28,
    contact_phone: '+2348000000007',
    specialties: 'Dry Cleaning, Ironing, Laundry',
    profiles: { full_name: 'Edo Cleaners' }
  },
  {
    id: 'dummy-8',
    service_category: 'Borehole Installation',
    location_area: 'Urumwon',
    street: 'Groundnut Junction',
    status: 'unverified',
    trust_score: 85,
    is_available: true,
    bio: 'Professional borehole drilling, water treatment, and pump installations. We guarantee clean water for your home.',
    profile_image: 'https://plus.unsplash.com/premium_photo-1664304298826-57235ff43624?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400&h=400&fit=crop',
    cover_image: 'https://plus.unsplash.com/premium_photo-1664304298826-57235ff43624?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=800&h=400&fit=crop',
    recommended_by: 12,
    contact_phone: '+2348000000008',
    specialties: 'Borehole Drilling, Water Treatment, Plumbing',
    profiles: { full_name: 'AquaTech Drilling' }
  },
  {
    id: 'dummy-9',
    service_category: 'Painting & Design',
    location_area: 'Urumwon',
    street: 'Mechanic Road',
    status: 'verified',
    trust_score: 98,
    is_available: true,
    bio: 'Interior and exterior painting, POP designs, and wallpaper installation to beautify your space.',
    profile_image: 'https://images.unsplash.com/photo-1742900280864-bcc27353ceba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop',
    recommended_by: 25,
    contact_phone: '+2348000000009',
    specialties: 'Painting, POP Design, Wallpapers',
    profiles: { full_name: 'ColorSplash Painters' }
  },
  {
    id: 'dummy-10',
    service_category: 'Tiles Installation',
    location_area: 'Urhumwon',
    street: 'Opposite Urhumwon Primary School',
    status: 'unverified',
    trust_score: 80,
    is_available: true,
    bio: 'Expert tiler for floors, walls, and bathrooms. Clean finishes and precise measurements.',
    profile_image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=400&fit=crop',
    recommended_by: 18,
    contact_phone: '+2348000000010',
    specialties: 'Floor Tiling, Wall Tiling, Interlocking',
    profiles: { full_name: 'Precision Tiles & Co.' }
  },
  {
    id: 'dummy-11',
    service_category: 'Solar Panel Installation',
    location_area: 'Urumwon',
    street: 'Mechanic Road',
    status: 'verified',
    trust_score: 96,
    is_available: true,
    bio: 'Professional solar panel installation, inverter setups, and battery maintenance. 24/7 power guaranteed.',
    profile_image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&h=400&fit=crop',
    recommended_by: 32,
    contact_phone: '+2348000000011',
    specialties: 'Solar Panels, Inverters, Battery Setup',
    profiles: { full_name: 'SunPower Energy Solutions' }
  }
];

export default function WorkerSearch() {
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [searchService, setSearchService] = useState(params.get('service') || '');
  const [searchStreet, setSearchStreet] = useState(params.get('street') || '');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedWorker, setSelectedWorker] = useState<WorkerSummary | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCallClick = (phone?: string) => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
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
      let query = supabase.from('workers').select('id, service_category, location_area, status, trust_score, is_available, created_at, profiles!workers_id_fkey(full_name)');

      if (serviceTerm) {
        query = query.ilike('service_category', `%${serviceTerm}%`);
      }
      if (streetTerm) {
        query = query.ilike('location_area', `%${streetTerm}%`);
      }

      const { data, error } = await query;
      if (error && error.code !== '42P01') console.warn('Supabase fetch error:', error);

      let filteredDummies = DUMMY_WORKERS;
      if (serviceTerm) {
        filteredDummies = filteredDummies.filter(w => w.service_category.toLowerCase().includes(serviceTerm.toLowerCase()));
      }
      if (streetTerm) {
        filteredDummies = filteredDummies.filter(w => w.street?.toLowerCase().includes(streetTerm.toLowerCase()));
      }

      const isProfileComplete = (worker: any) => {
        let count = 0;
        if (worker.profiles?.full_name) count++;
        if (worker.service_category) count++;
        if (worker.contact_phone) count++;
        if (worker.street || worker.location_area) count++;
        if (worker.bio) count++;
        if (worker.profile_image || worker.profile_image_url) count++;
        if (worker.cover_image) count++;
        return count === 7;
      };

      const dbWorkers = (data as unknown as WorkerSummary[]) || [];
      const completeDbWorkers = dbWorkers.filter(isProfileComplete);

      let localWorkers: WorkerSummary[] = JSON.parse(localStorage.getItem('local_workers') || '[]');
      localWorkers = localWorkers.filter(isProfileComplete);

      if (serviceTerm) {
        localWorkers = localWorkers.filter(w => w.service_category.toLowerCase().includes(serviceTerm.toLowerCase()));
      }
      if (streetTerm) {
        localWorkers = localWorkers.filter(w =>
          w.street?.toLowerCase().includes(streetTerm.toLowerCase()) ||
          w.location_area?.toLowerCase().includes(streetTerm.toLowerCase())
        );
      }

      setWorkers([...localWorkers, ...completeDbWorkers, ...filteredDummies.filter(isProfileComplete)]);
    } catch (err) {
      console.error(err);
      setWorkers(DUMMY_WORKERS);
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
          <Link to="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="text-xl font-bold text-primary hidden sm:block">Connect Local</Link>
        </div>
        <Link to="/login" className="text-primary font-medium text-sm border border-primary px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors">
          Worker Login
        </Link>
      </header>

      <div className="flex-1 p-4 w-full max-w-6xl mx-auto">
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
              <option value="Urhumwon Primary School" />
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
                    {worker.bio || 'Professional service provider in Urhumwon.'}
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

                  <div className="flex gap-4 mb-6">
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
                        {selectedWorker.recommended_by || 0}
                      </div>
                      <div className="text-xs text-blue-600 uppercase font-bold tracking-wide mt-1">Recommendations</div>
                    </div>
                  </div>

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
                        onClick={() => handleCallClick(selectedWorker.contact_phone)}
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
    </div>
  );
}
