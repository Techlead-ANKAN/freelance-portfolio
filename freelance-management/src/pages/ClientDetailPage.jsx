import React, { useState, useEffect } from 'react';
import { clientService } from '../services/auth';
import { projectService } from '../services/projects';
import { useCurrency } from '../contexts/CurrencyContext';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    PhoneIcon,
    CreditCardIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const ClientDetailPage = ({ clientId, onBack, onEdit, onDelete, onNavigateToProject }) => {
    const { formatAmount } = useCurrency();
    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalProjects: 0,
        completedProjects: 0,
        activeProjects: 0,
        totalRevenue: 0,
        totalAdvance: 0,
        totalRemaining: 0
    });

    useEffect(() => {
        if (clientId) {
            loadClientDetails();
        }
    }, [clientId]);

    const loadClientDetails = async () => {
        try {
            setLoading(true);
            const clientData = await clientService.getClient(clientId);
            setClient(clientData);

            const projectsData = await projectService.getProjectsByClient(clientId);
            setProjects(projectsData);

            // Calculate stats
            const totalProjects = projectsData.length;
            const completedProjects = projectsData.filter(p => p.status === 'completed').length;
            const activeProjects = projectsData.filter(p => ['in_progress', 'pending'].includes(p.status)).length;
            const totalRevenue = projectsData.reduce((sum, p) => sum + (p.total_amount || 0), 0);
            const totalAdvance = projectsData.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
            const totalRemaining = projectsData.reduce((sum, p) => sum + (p.remaining_amount || 0), 0);

            setStats({
                totalProjects,
                completedProjects,
                activeProjects,
                totalRevenue,
                totalAdvance,
                totalRemaining
            });
        } catch (error) {
            console.error('Failed to load client details:', error);
            setError('Failed to load client details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '⏳';
            case 'on_hold': return '⏸';
            case 'cancelled': return '✕';
            default: return '📋';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    <UserIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>{error || 'Client not found'}</p>
                </div>
                <button onClick={onBack} className="btn-primary">
                    <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                    Back to Clients
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="btn-secondary"
                    >
                        <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
                        Back to Clients
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-black">{client.name}</h1>
                        <p className="text-gray-600 mt-1">Client profile and project history</p>
                    </div>
                </div>
                
                <div className="flex space-x-3">
                    <button
                        onClick={() => onEdit(client)}
                        className="btn-secondary"
                    >
                        <PencilIcon className="w-5 h-5 inline mr-2" />
                        Edit Client
                    </button>
                    <button
                        onClick={() => onDelete(client)}
                        className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                        <TrashIcon className="w-5 h-5 inline mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Client Information and Projects */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Overview */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-black mb-6">Client Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <span className="text-sm text-gray-600 block">Full Name</span>
                                        <span className="font-semibold text-gray-900">{client.name}</span>
                                    </div>
                                </div>

                                {client.company && (
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <span className="text-sm text-gray-600 block">Company</span>
                                            <span className="font-medium text-gray-900">{client.company}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <CreditCardIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <span className="text-sm text-gray-600 block">Payment Mode</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {client.payment_mode}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <span className="text-sm text-gray-600 block">Email</span>
                                        <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                                            {client.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <span className="text-sm text-gray-600 block">Phone</span>
                                        <a href={`tel:${client.phone}`} className="font-medium text-blue-600 hover:text-blue-800">
                                            {client.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <CalendarDaysIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <span className="text-sm text-gray-600 block">Client Since</span>
                                        <span className="font-medium text-gray-900">
                                            {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {client.notes && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{client.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Projects List */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-black">Project History</h2>
                            <span className="text-sm text-gray-600">{projects.length} total projects</span>
                        </div>

                        {projects.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600">No projects yet</p>
                                <p className="text-sm text-gray-500 mt-1">Projects will appear here once created</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                                        onClick={() => onNavigateToProject(project.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg">{getStatusIcon(project.status)}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {project.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-4 mt-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                                        {project.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    
                                                    {project.services && project.services.length > 0 && (
                                                        <div className="flex space-x-1">
                                                            {project.services.slice(0, 2).map((service, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                                                    {service}
                                                                </span>
                                                            ))}
                                                            {project.services.length > 2 && (
                                                                <span className="text-xs text-gray-500">+{project.services.length - 2} more</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end space-y-2 ml-4">
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatAmount(project.total_amount || 0)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNavigateToProject(project.id);
                                                    }}
                                                    className="btn-secondary text-sm py-1 px-3"
                                                >
                                                    <EyeIcon className="w-4 h-4 inline mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Statistics and Summary */}
                <div className="space-y-6">
                    {/* Client Statistics */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Client Statistics</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Total Projects:</span>
                                <span className="font-semibold text-lg text-black">
                                    {stats.totalProjects}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Completed:</span>
                                <span className="font-medium text-green-600">
                                    {stats.completedProjects}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Active:</span>
                                <span className="font-medium text-blue-600">
                                    {stats.activeProjects}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                            Revenue Summary
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Total Revenue:</span>
                                <span className="font-semibold text-lg text-black">
                                    {formatAmount(stats.totalRevenue)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Total Paid:</span>
                                <span className="font-medium text-blue-600">
                                    {formatAmount(stats.totalAdvance)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 bg-red-50 rounded-lg px-3">
                                <span className="text-gray-700 font-medium">Total Remaining:</span>
                                <span className="font-bold text-lg text-red-600">
                                    {formatAmount(stats.totalRemaining)}
                                </span>
                            </div>
                        </div>

                        {/* Payment Completion Rate */}
                        {stats.totalRevenue > 0 && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Payment Completion</span>
                                    <span>{((stats.totalAdvance / stats.totalRevenue) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${Math.min((stats.totalAdvance / stats.totalRevenue) * 100, 100)}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project Status Distribution */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Project Status</h3>
                        
                        {stats.totalProjects > 0 ? (
                            <div className="space-y-3">
                                {[
                                    { status: 'completed', count: stats.completedProjects, color: 'bg-green-500' },
                                    { status: 'in_progress', count: projects.filter(p => p.status === 'in_progress').length, color: 'bg-blue-500' },
                                    { status: 'on_hold', count: projects.filter(p => p.status === 'on_hold').length, color: 'bg-yellow-500' },
                                    { status: 'cancelled', count: projects.filter(p => p.status === 'cancelled').length, color: 'bg-red-500' }
                                ].filter(item => item.count > 0).map((item) => (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                                            <span className="text-sm text-gray-700 capitalize">
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.count} ({((item.count / stats.totalProjects) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No projects to display</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => onEdit(client)}
                                className="w-full btn-secondary justify-center"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit Client Details
                            </button>
                            <button className="w-full btn-primary justify-center">
                                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                                Create New Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailPage;