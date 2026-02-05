import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projects';
import { clientService } from '../services/auth';
import { invoiceService } from '../services/invoices';
import { useCurrency } from '../contexts/CurrencyContext';
import ResourceManager from '../components/ResourceManager';
import InvoiceModal from '../components/InvoiceModal';
import InvoiceList from '../components/InvoiceList';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const ProjectDetailPage = ({ projectId, onBack, onEdit, onDelete }) => {
    const { formatAmount } = useCurrency();
    const [project, setProject] = useState(null);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Invoice modal state
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    useEffect(() => {
        if (projectId) {
            loadProjectDetails();
        }
    }, [projectId]);

    const loadProjectDetails = async () => {
        try {
            setLoading(true);
            const projectData = await projectService.getProject(projectId);
            setProject(projectData);

            if (projectData.client_id) {
                const clientData = await clientService.getClient(projectData.client_id);
                setClient(clientData);
            }
        } catch (error) {
            console.error('Failed to load project details:', error);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleResourcesChange = async (updatedResources) => {
        try {
            const updatedProject = await projectService.updateProject(projectId, {
                resources: updatedResources
            });
            setProject(updatedProject);
        } catch (error) {
            console.error('Failed to update resources:', error);
            alert('Failed to update resources');
        }
    };

    const handleCreateInvoice = async (invoiceData) => {
        try {
            setInvoiceLoading(true);
            
            if (editingInvoice) {
                // Update existing invoice
                await invoiceService.updateInvoice(editingInvoice.id, invoiceData);
            } else {
                // Create new invoice
                await invoiceService.createInvoice(invoiceData);
            }
            
            setShowInvoiceModal(false);
            setEditingInvoice(null);
            // Switch to invoices tab to show the invoice
            setActiveTab('invoices');
        } catch (error) {
            console.error('Failed to create invoice:', error);
            alert('Failed to create invoice: ' + error.message);
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleEditInvoice = (invoice) => {
        setEditingInvoice(invoice);
        setShowInvoiceModal(true);
    };

    const handleCloseInvoiceModal = () => {
        setShowInvoiceModal(false);
        setEditingInvoice(null);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>{error || 'Project not found'}</p>
                </div>
                <button onClick={onBack} className="btn-primary">
                    <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                    Back to Projects
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
                        Back to Projects
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-black">{project.title}</h1>
                        <p className="text-gray-600 mt-1">Project details and resources</p>
                    </div>
                </div>
                
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowInvoiceModal(true)}
                        className="btn-primary"
                    >
                        <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                        Create Invoice
                    </button>
                    <button
                        onClick={() => onEdit(project)}
                        className="btn-secondary"
                    >
                        <PencilIcon className="w-5 h-5 inline mr-2" />
                        Edit Project
                    </button>
                    <button
                        onClick={() => onDelete(project)}
                        className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                        <TrashIcon className="w-5 h-5 inline mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'invoices'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'resources'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Resources
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Project Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Overview */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-black mb-4">Project Overview</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                        <div className="flex items-center">
                                            <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="text-gray-900">{client?.name || 'Unknown Client'}</span>
                                            {client?.company && (
                                                <span className="text-gray-600 ml-2">({client.company})</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                                        <div className="flex items-center text-gray-900">
                                            <CalendarDaysIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span>
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                                                {project.end_date && (
                                                    <> → {new Date(project.end_date).toLocaleDateString()}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                                        <div className="flex flex-wrap gap-2">
                                            {project.services && project.services.length > 0 ? (
                                                project.services.map((service, index) => (
                                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {service}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 text-sm">No services specified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {project.description && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{project.description}</p>
                                </div>
                            )}

                            {project.notes && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{project.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Resources Section */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-black mb-4">Project Resources</h2>
                            <ResourceManager
                                services={project.services}
                                clientName={client?.name || 'Unknown'}
                                startDate={project.start_date}
                                resources={project.resources || []}
                                onResourcesChange={handleResourcesChange}
                                isEditing={true}
                            />
                        </div>
                    </div>

                    {/* Right Column - Payment Information */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                                Payment Summary {project.currency && <span className="text-sm text-gray-500 ml-2">({project.currency})</span>}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-semibold text-lg text-black">
                                        {formatAmount(project.total_amount || 0, project.currency || 'INR')}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-medium text-blue-600">
                                        {formatAmount(project.paid_amount || 0, project.currency || 'INR')}
                                    </span>
                                </div>
                                
                                {project.actual_received_amount && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-green-50 px-3 rounded">
                                        <span className="text-gray-600">Actual Received (INR):</span>
                                        <span className="font-medium text-green-600">
                                            ₹{parseFloat(project.actual_received_amount).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Paid Percentage:</span>
                                    <span className="font-medium text-blue-600">
                                        {project.paid_percent?.toFixed(1) || '0.0'}%
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                                    <span className="text-gray-700 font-medium">Remaining Amount:</span>
                                    <span className="font-bold text-lg text-red-600">
                                        {formatAmount(project.remaining_amount || 0, project.currency || 'INR')}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Progress Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Payment Progress</span>
                                    <span>{project.paid_percent?.toFixed(1) || '0'}% paid</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${Math.min(project.paid_percent || 0, 100)}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        {client && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-black mb-4">Client Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <span className="ml-2 font-medium">{client.name}</span>
                                    </div>
                                    {client.company && (
                                        <div>
                                            <span className="text-gray-600">Company:</span>
                                            <span className="ml-2">{client.company}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Email:</span>
                                        <span className="ml-2">{client.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="ml-2">{client.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Payment Mode:</span>
                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                            {client.payment_mode}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Stats */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-black mb-4">Project Stats</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Resources:</span>
                                    <span className="font-medium">{project.resources?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Services:</span>
                                    <span className="font-medium">{project.services?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">
                                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium">
                                        {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <div className="space-y-6">
                    <InvoiceList 
                        projectId={projectId}
                        project={project}
                        client={client}
                        onEditInvoice={handleEditInvoice}
                    />
                </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-black mb-4">Project Resources</h2>
                        <ResourceManager
                            resources={project.resources || []}
                            onResourcesChange={handleResourcesChange}
                            projectId={projectId}
                            clientName={client?.name}
                        />
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={handleCloseInvoiceModal}
                onSave={handleCreateInvoice}
                project={project}
                client={client}
                isLoading={invoiceLoading}
                editingInvoice={editingInvoice}
            />
        </div>
    );
};

export default ProjectDetailPage;