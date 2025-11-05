import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('tech-fl-ankan@local');
    const [password, setPassword] = useState('Tech-fl-ankan');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        
        if (!result.success) {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Subtle Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-100/40 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <img 
                                src="/logo.jpg" 
                                alt="Techlead-ANKAN Logo" 
                                className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4 ring-white/60 bg-white"
                            />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 bg-clip-text text-transparent mb-3">
                        Techlead-ANKAN
                    </h1>
                    <p className="text-lg text-slate-600 mb-2 font-medium">
                        Professional Freelance Portfolio
                    </p>
                    <p className="text-sm text-slate-500 mb-8">
                        Advanced Project Management & Client Relations Suite
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/70 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-2xl border border-white/40">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl text-slate-800 placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-sm"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl text-slate-800 placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="text-sm text-gray-500 text-center">
                            <p>Development credentials:</p>
                            <p className="font-mono text-xs mt-1">
                                tech-fl-ankan@local / Tech-fl-ankan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;