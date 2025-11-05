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
    PlusIcon
} from '@heroicons/react/24/outline';

const KPICard = ({ title, value, icon: Icon, color = 'black' }) => (
    <div className="card p-6">
        <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-${color === 'black' ? 'black' : 'gray-100'}`}>
                <Icon className={`w-6 h-6 ${color === 'black' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-black">{value}</p>
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
    <div className="card p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
        <div className="space-y-3">
            <button 
                onClick={onAddClient}
                className="w-full btn-primary text-left flex items-center"
            >
                <PlusIcon className="w-5 h-5 mr-3" />
                Add New Client
            </button>
            <button 
                onClick={onAddProject}
                className="w-full btn-secondary text-left flex items-center"
            >
                <PlusIcon className="w-5 h-5 mr-3" />
                Add New Project
            </button>
            <div className="pt-3">
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="input text-sm"
                />
            </div>
        </div>
    </div>
);

const DashboardPage = ({ onNavigate }) => {
    const { formatAmount } = useCurrency();
    const [kpis, setKpis] = useState({
        totalRevenue: 0,
        totalClients: 0,
        activeClients: 0,
        completedProjects: 0,
        pendingProjects: 0,
        pendingPayments: { count: 0, amount: 0 }
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load clients and projects for KPIs
            const [clients, projects, activities] = await Promise.all([
                clientService.getClients(),
                projectService.getProjects(),
                activityService.getRecentActivity(10)
            ]);

            // Calculate KPIs
            const totalRevenue = projects.reduce((sum, project) => sum + (project.total_amount || 0), 0);
            const completedProjects = projects.filter(p => p.status === 'completed').length;
            const pendingProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planned').length;
            const pendingPaymentsProjects = projects.filter(p => p.remaining_amount > 0);
            const pendingPaymentsAmount = pendingPaymentsProjects.reduce((sum, p) => sum + p.remaining_amount, 0);

            // Get unique active clients (clients with projects)
            const activeClientIds = new Set(projects.map(p => p.client_id));

            setKpis({
                totalRevenue,
                totalClients: clients.length,
                activeClients: activeClientIds.size,
                completedProjects,
                pendingProjects,
                pendingPayments: {
                    count: pendingPaymentsProjects.length,
                    amount: pendingPaymentsAmount
                }
            });

            setRecentActivity(activities);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header with Currency Switcher */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={formatAmount(kpis.totalRevenue)}
                    icon={CurrencyDollarIcon}
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
                <KPICard
                    title="Pending Payments"
                    value={`${kpis.pendingPayments.count} (${formatAmount(kpis.pendingPayments.amount)})`}
                    icon={CurrencyDollarIcon}
                    color="gray"
                />
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Recent Activity</h3>
                        <div className="space-y-1">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <QuickActions 
                        onAddClient={() => onNavigate('clients', { action: 'add' })}
                        onAddProject={() => onNavigate('projects', { action: 'add' })}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;