import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search');
  };

  const popularServices = [
    { name: 'Plumber', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Electrician', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'House Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Makeup Artist', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Barber', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Tailor', img: 'https://images.unsplash.com/photo-1687422809069-0fa3546b8471?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Carpenter', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Mechanic', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <header className="container mx-auto px-4 py-4 flex justify-between items-center z-50 relative">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tight">Connect Local</Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/search" className="text-base font-medium transition-colors hover:text-primary">Find a Pro</Link>
          <Link to="/login" className="text-base font-medium transition-colors hover:text-primary">Login</Link>
          <Link to="/signup" className="bg-white text-primary border-2 border-primary px-5 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors">
            Offer Your Service
          </Link>
        </div>
        {/* Mobile menu simple fallback */}
        <div className="md:hidden flex gap-4 items-center">
          <Link to="/signup" className="text-primary font-medium text-sm">Join as Pro</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-16 text-center relative isolate min-h-[500px] flex flex-col justify-center items-center">
        {/* Abstract Background Elements matching viscorner */}
        <div className="absolute inset-0 -z-20 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="flex flex-col gap-8 mx-auto max-w-4xl z-10 w-full">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.3] font-bold text-center relative md:mx-auto">
            <div className="hidden md:block absolute text-xs bg-primary rounded-xl p-2 text-white font-medium -top-8 -left-12 -rotate-12">
              Verified Professionals by the Community
            </div>
            Find local professionals for everything you need
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl leading-[1.5] text-gray-600 text-center mx-auto max-w-[630px]">
            From cleaning to car repairs to glam makeovers — Connect Local connects you with the right pros, fast in the Community.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row mx-auto w-full md:max-w-3xl items-center bg-white shadow-xl border border-gray-200 rounded-3xl md:rounded-full p-2 md:pl-4">
            <div className="relative flex flex-1 items-center w-full px-2 py-3 md:py-4">
              <Search className="text-gray-400 w-5 h-5 mr-2 shrink-0" />
              <input type="text" placeholder="What service do you need?" className="w-full flex-1 border-none focus:outline-none bg-transparent placeholder:text-gray-400 text-base md:text-lg" />
            </div>

            <div className="hidden md:block text-gray-300 mx-2">|</div>
            <div className="w-full md:hidden border-t border-gray-100 my-1"></div>

            <div className="relative flex flex-1 items-center w-full px-2 py-3 md:py-4">
              <MapPin className="text-gray-400 w-5 h-5 mr-2 shrink-0" />
              <input type="text" defaultValue="Urhumwon, Egor" disabled className="w-full min-w-0 flex-1 border-none focus:outline-none bg-transparent placeholder:text-gray-400 text-base md:text-lg" />
              <button type="button" className="shrink-0 p-2 text-gray-400 hover:bg-gray-100 rounded-full" title="Detect my location">
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            <button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-3 md:py-4 font-medium text-base md:text-lg transition-all mt-2 md:mt-0 md:mr-1">
              Get Started
            </button>
          </form>
        </div>
      </section>

      {/* Stats/Trust Section (Viscorner style) */}
      <div className="container mx-auto px-4 z-10 relative md:-mt-10 mb-20">
        <div className="flex mx-auto w-full max-w-4xl rounded-3xl py-6 md:py-8 px-6 bg-primary flex-col md:flex-row text-center shadow-lg">
          <div className="flex-1 flex flex-col p-4 border-b md:border-b-0 md:border-r border-white/20">
            <h3 className="text-3xl lg:text-4xl text-white font-bold pb-2">100%</h3>
            <p className="text-blue-100 text-sm md:text-base">Local to Urhumwon</p>
          </div>
          <div className="flex-1 flex flex-col p-4 border-b md:border-b-0 md:border-r border-white/20">
            <h3 className="text-3xl lg:text-4xl text-white font-bold pb-2">Verified</h3>
            <p className="text-blue-100 text-sm md:text-base">Community backed pros</p>
          </div>
          <div className="flex-1 flex flex-col p-4">
            <h3 className="text-3xl lg:text-4xl text-white font-bold pb-2">Free</h3>
            <p className="text-blue-100 text-sm md:text-base">No upfront platform fees</p>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10">How it works?</h2>
        <div className="flex w-full rounded-3xl py-6 md:py-10 px-6 justify-center bg-gray-50 border border-gray-100 flex-col md:flex-row text-center lg:text-left gap-8 md:gap-0">
          <div className="flex-1 flex flex-col px-4 lg:px-8 border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0">
            <div className="flex gap-4 flex-col items-center justify-center lg:justify-start lg:flex-row pb-4">
              <div className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-full shrink-0">1</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Make a search</h3>
            </div>
            <p className="text-gray-600">Tell us what you need done by searching for the exact service you are looking for.</p>
          </div>
          <div className="flex-1 flex flex-col px-4 lg:px-8 border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0">
            <div className="flex gap-4 flex-col items-center justify-center lg:justify-start lg:flex-row pb-4">
              <div className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-full shrink-0">2</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Review pros</h3>
            </div>
            <p className="text-gray-600">Compare verified local workers, check their trust score, and view their past work.</p>
          </div>
          <div className="flex-1 flex flex-col px-4 lg:px-8">
            <div className="flex gap-4 flex-col items-center justify-center lg:justify-start lg:flex-row pb-4">
              <div className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-full shrink-0">3</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Hire directly</h3>
            </div>
            <p className="text-gray-600">Contact the worker directly through a phone call and negotiate your terms.</p>
          </div>
        </div>
      </section>

      {/* Popular Services Section (Viscorner Image Grid style) */}
      <section className="bg-gray-50 py-20 w-full border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6">Popular services</h2>
          <p className="text-lg text-center text-gray-600 mx-auto max-w-2xl mb-12">
            Discover the most in-demand services trusted by residents across Urhumwon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularServices.map((service, idx) => (
              <Link to={`/search?service=${encodeURIComponent(service.name)}`} key={idx} className="group relative rounded-xl overflow-hidden h-[250px] md:h-[300px] w-full shadow-sm hover:shadow-xl transition-all duration-300">
                <img src={service.img} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                  <span className="text-xl font-bold text-white relative z-10">{service.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/search" className="inline-block bg-white text-gray-900 border border-gray-300 hover:border-gray-400 font-medium rounded-full px-8 py-3 transition-all">
              View all services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-center text-gray-400">
        <div className="container mx-auto px-4">
          <div className="text-2xl font-bold text-white tracking-tight mb-4">Connect Local</div>
          <p className="mb-8">Built for Urhumwon Community, Egor LGA.</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} Connect Local. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
