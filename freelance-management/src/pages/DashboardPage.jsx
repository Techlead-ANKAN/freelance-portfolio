import React, { useState, useEffect } from 'react';
import { clientService } from '../services/auth';
import { projectService } from '../services/projects';
import { useCurrency } from '../contexts/CurrencyContext';
import { activityService } from '../services/index';
import { 
    UsersIcon, 
    BriefcaseIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    PlusIcon,
    CalendarIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

const KPICard = ({ title, value, icon: Icon, color = 'black' }) => (
    <div className="card p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center">
            <div className={`p-2 sm:p-3 rounded-lg bg-${color === 'black' ? 'black' : 'gray-100'} flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color === 'black' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black break-words">{value}</p>
            </div>
        </div>
    </div>
);

const ActivityItem = ({ activity }) => {
    const formatAction = (action) => {
        switch (action) {
            case 'created': return 'Created';
            case 'updated': return 'Updated';
            case 'deleted': return 'Deleted';
            case 'added_resource': return 'Added resource to';
            default: return action;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-start space-x-3 py-3">
            <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                    <span className="font-medium">{formatAction(activity.action)}</span>
                    {' '}
                    <span className="text-gray-600">{activity.entity_type}</span>
                    {' '}
                    <span className="font-medium">{activity.entity_id}</span>
                </p>
                <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
            </div>
        </div>
    );
};

const QuickActions = ({ onAddClient, onAddProject }) => (
    <div className="card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Quick Actions</h3>
        <div className="space-y-2 sm:space-y-3">
            <button 
                onClick={onAddClient}
                className="w-full btn-primary text-left flex items-center justify-center sm:justify-start text-sm sm:text-base py-2 sm:py-3"
            >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">Add New Client</span>
            </button>
            <button 
                onClick={onAddProject}
                className="w-full btn-secondary text-left flex items-center justify-center sm:justify-start text-sm sm:text-base py-2 sm:py-3"
            >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">Add New Project</span>
            </button>
            <div className="pt-2 sm:pt-3">
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="input text-xs sm:text-sm w-full"
                />
            </div>
        </div>
    </div>
);

const RevenueFilter = ({ selectedPeriod, onPeriodChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState('right-0');
    const dropdownRef = React.useRef(null);
    const buttonRef = React.useRef(null);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: 'all', label: 'All Months' },
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Calculate dropdown position to prevent cutoff
    const calculateDropdownPosition = () => {
        if (!buttonRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 288; // w-72 = 288px
        
        // Check if dropdown would overflow on the right side
        if (buttonRect.right + dropdownWidth > viewportWidth) {
            // Position from the right edge of the button
            setDropdownPosition('right-0');
        } else {
            // Position from the left edge of the button
            setDropdownPosition('left-0');
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            calculateDropdownPosition();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Prevent body scroll when dropdown is open on mobile
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Recalculate position on window resize
    React.useEffect(() => {
        const handleResize = () => {
            if (isOpen) {
                calculateDropdownPosition();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
            >
                <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    {selectedPeriod.month === 'all' ? 'All ' : months.find(m => m.value === selectedPeriod.month)?.label.substring(0, 3) + ' '}
                    {selectedPeriod.year}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className={`absolute top-full mt-2 w-72 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 
                                    max-w-[calc(100vw-1rem)] 
                                    ${dropdownPosition}
                                    origin-top-right transform-gpu`}>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4 sm:hidden">
                                <h3 className="text-lg font-semibold text-gray-900">Filter Revenue</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                                <select
                                    value={selectedPeriod.year}
                                    onChange={(e) => onPeriodChange({ ...selectedPeriod, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                                <select
                                    value={selectedPeriod.month}
                                    onChange={(e) => onPeriodChange({ ...selectedPeriod, month: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>{month.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                                >
                                    Apply Filter
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors sm:hidden"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const DashboardPage = ({ onNavigate }) => {
    const { formatAmount } = useCurrency();
    const [kpis, setKpis] = useState({
        totalRevenue: 0,
        filteredRevenue: 0,
        totalClients: 0,
        activeClients: 0,
        completedProjects: 0,
        pendingProjects: 0,
        pendingPayments: { count: 0, amount: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState({
        year: new Date().getFullYear(),
        month: 'all'
    });
    const [allProjects, setAllProjects] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        calculateFilteredRevenue();
    }, [selectedPeriod, allProjects]);

    const loadDashboardData = async () => {
        try {
            // Load clients and projects for KPIs
            const [clients, projects] = await Promise.all([
                clientService.getClients(),
                projectService.getProjects()
            ]);

            // Store all projects for filtering
            setAllProjects(projects);

            // Calculate KPIs
            const totalRevenue = projects.reduce((sum, project) => sum + (project.total_amount || 0), 0);
            const completedProjects = projects.filter(p => p.status === 'completed').length;
            const pendingProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planned').length;
            const pendingPaymentsProjects = projects.filter(p => p.remaining_amount > 0);
            const pendingPaymentsAmount = pendingPaymentsProjects.reduce((sum, p) => sum + p.remaining_amount, 0);

            // Get unique active clients (clients with projects)
            const activeClientIds = new Set(projects.map(p => p.client_id));

            setKpis(prevKpis => ({
                ...prevKpis,
                totalRevenue,
                totalClients: clients.length,
                activeClients: activeClientIds.size,
                completedProjects,
                pendingProjects,
                pendingPayments: {
                    count: pendingPaymentsProjects.length,
                    amount: pendingPaymentsAmount
                }
            }));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFilteredRevenue = () => {
        if (!allProjects.length) return;

        let filteredProjects = allProjects;

        // Filter by year and month
        if (selectedPeriod.year || selectedPeriod.month !== 'all') {
            filteredProjects = allProjects.filter(project => {
                if (!project.created_at && !project.start_date) return false;
                
                const projectDate = new Date(project.created_at || project.start_date);
                const projectYear = projectDate.getFullYear();
                const projectMonth = String(projectDate.getMonth() + 1).padStart(2, '0');

                const yearMatch = !selectedPeriod.year || projectYear === selectedPeriod.year;
                const monthMatch = selectedPeriod.month === 'all' || projectMonth === selectedPeriod.month;

                return yearMatch && monthMatch;
            });
        }

        const filteredRevenue = filteredProjects.reduce((sum, project) => sum + (project.total_amount || 0), 0);
        
        setKpis(prevKpis => ({
            ...prevKpis,
            filteredRevenue
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Page Header with Revenue Filter */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black truncate">Dashboard</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
                </div>
                <div className="flex-shrink-0">
                    <RevenueFilter 
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <KPICard
                    title="Total Revenue (All Time)"
                    value={formatAmount(kpis.totalRevenue)}
                    icon={CurrencyDollarIcon}
                />
                <KPICard
                    title={`Revenue (${selectedPeriod.month === 'all' ? 'All' : new Date(2024, selectedPeriod.month - 1).toLocaleString('default', { month: 'long' })} ${selectedPeriod.year})`}
                    value={formatAmount(kpis.filteredRevenue)}
                    icon={CurrencyDollarIcon}
                    color="gray"
                />
                <KPICard
                    title="Total Clients"
                    value={kpis.totalClients}
                    icon={UsersIcon}
                />
                <KPICard
                    title="Active Clients"
                    value={kpis.activeClients}
                    icon={UsersIcon}
                    color="gray"
                />
                <KPICard
                    title="Completed Projects"
                    value={kpis.completedProjects}
                    icon={CheckCircleIcon}
                />
                <KPICard
                    title="Pending Projects"
                    value={kpis.pendingProjects}
                    icon={ClockIcon}
                />
                <div className="sm:col-span-2 lg:col-span-1">
                    <KPICard
                        title="Pending Payments"
                        value={`${kpis.pendingPayments.count} (${formatAmount(kpis.pendingPayments.amount)})`}
                        icon={CurrencyDollarIcon}
                        color="gray"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                    <QuickActions 
                        onAddClient={() => onNavigate('clients', { action: 'add' })}
                        onAddProject={() => onNavigate('projects', { action: 'add' })}
                    />
                </div>
                {/* Empty space for future content */}
                <div className="lg:col-span-2 hidden lg:block">
                    {/* Reserved space for charts or other widgets */}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;