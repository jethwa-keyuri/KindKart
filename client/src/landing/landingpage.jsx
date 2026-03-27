import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200 overflow-x-hidden">
            
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 tracking-tight">KindKart</h2>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                className="px-5 py-2.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors duration-200 hidden sm:block" 
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                            <button 
                                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg rounded-full transition-all duration-200 transform hover:-translate-y-0.5" 
                                onClick={() => navigate('/register')}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113511252-0fb30d291b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-slate-50"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
                        <span className="block text-slate-900 mb-2">Bridge the gap between</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">surplus and scarcity.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed">
                        KindKart connects food donors with nearby NGOs in real-time, ensuring that extra meals reach those who need them most before time runs out.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 items-center">
                        <button 
                            className="px-8 py-4 w-full sm:w-auto text-base md:text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate('/register')}
                        >
                            Get Started Now
                        </button>
                        <button 
                            className="px-8 py-4 w-full sm:w-auto text-base md:text-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                            onClick={() => {
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Core Platform</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Our Features
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Everything you need to seamlessly coordinate food donations and drive real impact in your community.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            
                            {/* Feature 1 */}
                            <div className="pt-6">
                                <div className="flow-root bg-slate-50 rounded-3xl px-6 pb-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group h-full">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-xl font-bold text-gray-900 tracking-tight">Real-time meal tracking</h3>
                                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                                            Monitor meal availability the exact moment surplus is posted. Map views and instant alerts make pickups remarkably efficient.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="pt-6">
                                <div className="flow-root bg-slate-50 rounded-3xl px-6 pb-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group h-full">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-xl font-bold text-gray-900 tracking-tight">Seamless communication</h3>
                                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                                            Direct messaging between donors and NGOs ensures logistics are smooth and any potential hiccups are resolved in seconds.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="pt-6">
                                <div className="flow-root bg-slate-50 rounded-3xl px-6 pb-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group h-full">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-xl font-bold text-gray-900 tracking-tight">Impact tracking</h3>
                                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                                            Visualize the profound difference you make with detailed reports on meals salvaged and carbon footprint effectively reduced.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 bg-emerald-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDQ3ODU3IiAvPgo8cGF0aCBkPSJNMCAwbDhfOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAzNmI0ZiIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
                        Join Us in Making a Difference
                    </h2>
                    <p className="mt-6 text-xl leading-relaxed text-emerald-50 max-w-2xl mx-auto">
                        Sign up today and help us combat food waste while feeding those in need. Every single meal makes a difference.
                    </p>
                    <div className="mt-10 flex justify-center">
                        <button 
                            className="px-10 py-5 text-lg font-bold text-emerald-800 bg-white rounded-full shadow-2xl hover:bg-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate('/register')}
                        >
                            Start Donating Today
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-slate-400">
                    <div className="mb-4 md:mb-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">KindKart</span>
                        <span className="ml-3 text-sm border-l border-slate-700 pl-3">© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                    <div className="flex space-x-8">
                        <span className="hover:text-emerald-400 cursor-pointer transition-colors duration-200" onClick={() => navigate('/login')}>Login</span>
                        <span className="hover:text-emerald-400 cursor-pointer transition-colors duration-200" onClick={() => navigate('/register')}>Sign Up</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;