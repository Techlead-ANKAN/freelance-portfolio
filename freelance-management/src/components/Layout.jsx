import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    HomeIcon, 
    UsersIcon, 
    BriefcaseIcon, 
    TableCellsIcon,
    CogIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header-professional sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {/* Mobile branding */}
                    <div className="flex items-center lg:hidden">
                        <div className="relative">
                            <img 
                                src="/logo.jpg" 
                                alt="Techlead-ANKAN Logo" 
                                className="w-10 h-10 rounded-full object-cover shadow-lg ring-2 ring-white mr-3"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Techlead-ANKAN
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Professional Suite</p>
                        </div>
                    </div>
                    {/* Desktop - elegant breadcrumb */}
                    <div className="hidden lg:flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-600">Dashboard Overview</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:block">
                        <span className="text-sm text-gray-600">
                            Welcome, <span className="font-medium">Tech-fl-ankan</span>
                        </span>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
                        title="Logout"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

const Sidebar = ({ currentPage, onPageChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
        { id: 'clients', label: 'Clients', icon: UsersIcon },
        { id: 'projects', label: 'Projects', icon: BriefcaseIcon },
        { id: 'database', label: 'Database', icon: TableCellsIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:pt-20 sidebar-professional">
                {/* Sidebar Branding */}
                <div className="px-6 pb-8 border-b border-slate-200/60">
                    <div className="text-center">
                        <div className="relative inline-block mb-4">
                            <img 
                                src="/logo.jpg" 
                                alt="Techlead-ANKAN Logo" 
                                className="w-28 h-28 rounded-2xl object-cover shadow-2xl ring-4 ring-white mx-auto"
                            />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2">
                            Techlead-ANKAN
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mb-1">Freelance Portfolio</p>
                        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-xs font-semibold text-slate-600">Online</span>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out group ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:shadow-md'
                                }`}
                            >
                                <div className={`relative ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} transition-colors duration-300`}>
                                    <Icon className="w-5 h-5 mr-4" />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-white/20 rounded-md blur-sm"></div>
                                    )}
                                </div>
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-white/60 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
                <nav className="flex justify-around">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                                    currentPage === item.id
                                        ? 'text-black'
                                        : 'text-gray-600'
                                }`}
                            >
                                <Icon className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
};

const Layout = ({ children, currentPage, onPageChange }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            <Header />
            <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
            
            {/* Main content */}
            <div className="lg:pl-72 pt-0 pb-20 lg:pb-0">
                <main className="px-6 py-8 lg:px-8 lg:py-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;