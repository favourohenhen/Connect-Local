import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Phone } from 'lucide-react';

interface Worker {
  id: string;
  service_category: string;
  location_area: string;
  years_experience: number;
  is_available: boolean;
  contact_phone: string;
  status: string;
  trust_score: number;
  known_landmark: string;
  profiles: {
    full_name: string;
  };
}

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*, profiles(full_name)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setWorker(data as unknown as Worker);
      } catch (error) {
        console.error('Error fetching worker:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorker();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!worker) return <div className="p-8 text-center">Worker not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 font-medium text-sm">
            &larr; Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate hidden sm:block">
            {worker.profiles?.full_name}
          </h1>
        </div>
        <Link to="/" className="text-xl font-bold text-primary">Connect Local</Link>
      </header>
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 text-center border-b border-gray-100">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
               {/* Placeholder for Profile image */}
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${worker.profiles?.full_name}`} alt={worker.profiles?.full_name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{worker.profiles?.full_name}</h2>
            <p className="text-gray-500 mb-2">{worker.service_category} • {worker.location_area}</p>
            
            <div className="flex justify-center items-center gap-2 mb-4">
               {worker.status === 'verified' && (
                 <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                   Verified
                 </span>
               )}
               {worker.is_available ? (
                 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Available</span>
               ) : (
                 <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Busy</span>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Trust Score</div>
                <div className="font-bold text-gray-900 text-lg">{worker.trust_score}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Experience</div>
                <div className="font-bold text-gray-900 text-lg">{worker.years_experience} yrs</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
             {worker.contact_phone ? (
               <a href={`tel:${worker.contact_phone}`} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium transition-colors">
                 <Phone className="w-5 h-5" />
                 Direct Call
               </a>
             ) : (
               <div className="w-full text-center p-3 bg-gray-50 text-gray-500 rounded-xl">Phone number not provided</div>
             )}
             
             {worker.known_landmark && (
               <div className="mt-6 text-sm text-gray-600 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                 <strong>Known for working at:</strong> {worker.known_landmark}
               </div>
             )}
          </div>
        </div>
        
        {/* Placeholder for Portfolio & Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
           <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h3>
           <div className="text-gray-500 text-center py-8">No portfolio images uploaded yet.</div>
        </div>
      </main>
    </div>
  );
}
