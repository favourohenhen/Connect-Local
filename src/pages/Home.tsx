import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Connect Local</h1>
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-8">
            <p className="font-semibold text-sm">
              Safety Notice: Always confirm price before work begins. Avoid paying upfront unless necessary. Report any suspicious behavior immediately.
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Find trusted local professionals</h2>
            <Link to="/search" className="text-primary hover:underline font-medium">Search all &rarr;</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['Electrician', 'Plumber', 'Barber', 'Tailor', 'Carpenter', 'Cleaner'].map((category) => (
                <Link to="/search" key={category} className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-xl">{category[0]}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{category}</h3>
                </Link>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
