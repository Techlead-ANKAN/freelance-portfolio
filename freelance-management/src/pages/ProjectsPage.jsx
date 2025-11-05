import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projects';
import { clientService } from '../services/auth';
import { useCurrency } from '../contexts/CurrencyContext';
import ResourceManager from '../components/ResourceManager';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    EyeIcon,
    TrashIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';

const ProjectCard = ({ project, client, onEdit, onView, onDelete, onNavigate }) => {
    const { formatAmount } = useCurrency();
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div 
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigate('project-detail', { projectId: project.id })}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{client?.name || 'Unknown Client'}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(project);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View details"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit project"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete project"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    <span>Total: {formatAmount(project.total_amount || 0)}</span>
                    <span className="mx-2">•</span>
                    <span>Remaining: {formatAmount(project.remaining_amount || 0)}</span>
                </div>
                
                {project.start_date && (
                    <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-2" />
                        <span>{new Date(project.start_date).toLocaleDateString()}</span>
                        {project.end_date && (
                            <>
                                <span className="mx-2">→</span>
                                <span>{new Date(project.end_date).toLocaleDateString()}</span>
                            </>
                        )}
                    </div>
                )}

                {project.services && project.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {project.services.slice(0, 3).map((service, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                {service}
                            </span>
                        ))}
                        {project.services.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                +{project.services.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProjectModal = ({ project, clients, isOpen, onClose, onSave, isLoading }) => {
    const { getCurrencySymbol, formatAmount } = useCurrency();
    const [formData, setFormData] = useState({
        title: '',
        client_id: '',
        description: '',
        services: [],
        start_date: '',
        end_date: '',
        status: 'planned',
        total_amount: '',
        paid_amount: '',
        remaining_amount: '',
        notes: '',
        resources: []
    });
    
    // Simple amount formatting for INR only
    const showExactAmount = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const [availableServices] = useState([
        'Website development',
        'SEO optimisation',
        'Domain registration',
        'Hosting setup',
        'UI/UX design',
        'UI Design (Figma)',
        'Video Editing',
        'Digital Marketing',
        'Social Media Handling',
        'Landing page',
        'Maintenance',
        'Other'
    ]);

    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        if (project) {
            // Load project data directly (no currency conversion needed)
            setFormData({
                title: project.title || '',
                client_id: project.client_id || '',
                description: project.description || '',
                services: project.services || [],
                start_date: project.start_date || '',
                end_date: project.end_date || '',
                status: project.status || 'planned',
                total_amount: project.total_amount || '',
                paid_amount: project.paid_amount || '',
                remaining_amount: project.remaining_amount || '',
                notes: project.notes || '',
                resources: project.resources || []
            });
            
            if (project.client_id) {
                const client = clients.find(c => c.id === project.client_id);
                setSelectedClient(client);
            }
        } else {
            setFormData({
                title: '',
                client_id: '',
                description: '',
                services: [],
                start_date: '',
                end_date: '',
                status: 'planned',
                total_amount: '',
                paid_amount: '',
                remaining_amount: '',
                notes: '',
                resources: []
            });
            setSelectedClient(null);
        }
    }, [project, clients, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.client_id) {
            alert('Please fill in title and select a client');
            return;
        }

        // Process amounts and remove remaining_amount (let database calculate it)
        const dataToSave = {
            ...formData,
            total_amount: parseFloat(formData.total_amount) || 0,
            paid_amount: parseFloat(formData.paid_amount) || 0
        };
        
        // Remove remaining_amount since it should be calculated by database
        delete dataToSave.remaining_amount;

        onSave(dataToSave);
    };

    const handleServiceToggle = (service) => {
        const updatedServices = formData.services.includes(service)
            ? formData.services.filter(s => s !== service)
            : [...formData.services, service];
        
        setFormData({ ...formData, services: updatedServices });
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        setSelectedClient(client);
        setFormData({ ...formData, client_id: clientId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                        {project ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Project Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="label">Project Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="input"
                                    placeholder="Website + SEO + UI Design + Digital Marketing"
                                />
                            </div>

                            <div>
                                <label className="label">Client *</label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => handleClientChange(e.target.value)}
                                    className="input"
                                >
                                    <option value="">Select a client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company && `(${client.company})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="input h-24 resize-none"
                                    placeholder="Full website with 6 pages, blog, basic SEO..."
                                />
                            </div>

                            <div>
                                <label className="label">Services</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {availableServices.map(service => (
                                        <label key={service} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.services.includes(service)}
                                                onChange={() => handleServiceToggle(service)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="input"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Right Column - Payment & Resources */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="label">Total Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                                        className="input"
                                        placeholder="150.00"
                                    />
                                </div>
                                
                                <div>
                                    <label className="label">Paid Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
                                        className="input"
                                        placeholder="15.00"
                                    />
                                </div>

                                <div>
                                    <label className="label">Remaining Amount (₹) <span className="text-xs text-gray-500">(Auto-calculated)</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={parseFloat(formData.total_amount || 0) - parseFloat(formData.paid_amount || 0)}
                                        className="input bg-gray-50"
                                        placeholder="0.00"
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Payment Summary */}
                            {formData.total_amount && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-medium text-gray-900 mb-2">Payment Summary</h5>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Amount:</span>
                                            <span>{showExactAmount(formData.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Paid Amount:</span>
                                            <span>{showExactAmount(formData.paid_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Paid %:</span>
                                            <span>
                                                {formData.total_amount > 0 
                                                    ? Math.round((parseFloat(formData.paid_amount || 0) / parseFloat(formData.total_amount)) * 100)
                                                    : 0
                                                }%
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t pt-1 mt-2">
                                            <span>Remaining:</span>
                                            <span>{showExactAmount(parseFloat(formData.total_amount || 0) - parseFloat(formData.paid_amount || 0))}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="input h-20 resize-none"
                                    placeholder="Advance paid via Mpesa..."
                                />
                            </div>

                            {/* Resources Section */}
                            {selectedClient && (
                                <div>
                                    <label className="label">Project Resources</label>
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <ResourceManager
                                            clientName={selectedClient.name}
                                            projectName={formData.title}
                                            resources={formData.resources}
                                            onResourcesChange={(resources) => setFormData({...formData, resources})}
                                            isEditing={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectsPage = ({ onNavigate, params = null, onClearParams }) => {
    const { formatAmount, getCurrencySymbol } = useCurrency();
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal states
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        loadData();
    }, []);
    
    // Handle navigation parameters (e.g., edit project from detail page)
    useEffect(() => {
        if (params?.editProject) {
            setSelectedProject(params.editProject);
            setShowProjectModal(true);
        }
    }, [params]);

    useEffect(() => {
        // Filter projects based on search term and status
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        setFilteredProjects(filtered);
    }, [projects, searchTerm, statusFilter]);

    const loadData = async () => {
        try {
            const [projectsData, clientsData] = await Promise.all([
                projectService.getProjects(),
                clientService.getClients()
            ]);
            setProjects(projectsData);
            setClients(clientsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = async (projectData) => {
        setModalLoading(true);
        try {
            if (selectedProject) {
                await projectService.updateProject(selectedProject.id, projectData);
            } else {
                await projectService.createProject(projectData);
            }
            await loadData();
            setShowProjectModal(false);
            setSelectedProject(null);
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('Failed to save project: ' + error.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewProject = (project) => {
        alert(`View details for "${project.title}" - Full project view will be implemented next!`);
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        setShowProjectModal(true);
    };

    const handleDeleteProject = async (project) => {
        if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
            try {
                await projectService.deleteProject(project.id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete project:', error);
                alert('Failed to delete project: ' + error.message);
            }
        }
    };

    const getClientById = (clientId) => {
        return clients.find(c => c.id === clientId);
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black">Projects</h1>
                    <p className="text-gray-600 mt-1">Track and manage all your client projects with resources.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedProject(null);
                        setShowProjectModal(true);
                    }}
                    className="btn-primary mt-4 sm:mt-0"
                >
                    <PlusIcon className="w-5 h-5 inline mr-2" />
                    Add Project
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input sm:w-48"
                >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        client={getClientById(project.client_id)}
                        onEdit={handleEditProject}
                        onView={handleViewProject}
                        onDelete={handleDeleteProject}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {projects.length === 0 ? 'No projects yet' : 'No projects found'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {projects.length === 0 
                            ? 'Start by creating your first project.'
                            : 'Try adjusting your search terms or filters.'
                        }
                    </p>
                    {projects.length === 0 && (
                        <button
                            onClick={() => {
                                setSelectedProject(null);
                                setShowProjectModal(true);
                            }}
                            className="btn-primary"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Create Your First Project
                        </button>
                    )}
                </div>
            )}

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                clients={clients}
                isOpen={showProjectModal}
                onClose={() => {
                    setShowProjectModal(false);
                    setSelectedProject(null);
                    if (onClearParams) onClearParams();
                }}
                onSave={handleSaveProject}
                isLoading={modalLoading}
            />
        </div>
    );
};

export default ProjectsPage;