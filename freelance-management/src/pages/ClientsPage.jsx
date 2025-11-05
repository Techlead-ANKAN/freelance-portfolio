import React, { useState, useEffect } from 'react';
import { clientService } from '../services/auth';
import { projectService } from '../services/projects';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
    PlusIcon, 
    MagnifyingGlassIcon, 
    PencilIcon, 
    EyeIcon,
    TrashIcon,
    XMarkIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

const ClientCard = ({ client, onEdit, onView, onDelete, onNavigate }) => (
                                        <div 
                                        key={client.id} 
                                        className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => onNavigate('client-detail', { clientId: client.id })}
                                    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-black">{client.name}</h3>
                {client.company && (
                    <p className="text-sm text-gray-600 mt-1">{client.company}</p>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                    <p>{client.country}</p>
                </div>
                <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {client.payment_mode}
                    </span>
                </div>
            </div>
            <div className="flex space-x-2 ml-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(client);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View details"
                >
                    <EyeIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(client);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit client"
                >
                    <PencilIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(client);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete client"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const ClientModal = ({ client, isOpen, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        country: '',
        phone: '',
        email: '',
        company_email: '',
        payment_mode: 'Bank Transfer',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                company: client.company || '',
                country: client.country || '',
                phone: client.phone || '',
                email: client.email || '',
                company_email: client.company_email || '',
                payment_mode: client.payment_mode || 'Bank Transfer',
                notes: client.notes || ''
            });
        } else {
            setFormData({
                name: '',
                company: '',
                country: '',
                phone: '',
                email: '',
                company_email: '',
                payment_mode: 'Bank Transfer',
                notes: ''
            });
        }
        setErrors({});
    }, [client, isOpen]);

    const paymentModes = [
        'UPI',
        'Bank Transfer',
        'PayPal',
        'Stripe',
        'Razorpay',
        'Paytm',
        'PhonePe',
        'Google Pay',
        'Apple Pay',
        'Crypto (USDT)',
        'Crypto (Bitcoin)',
        'Crypto (Ethereum)',
        'Wire Transfer',
        'Western Union',
        'MoneyGram',
        'Wise (formerly TransferWise)',
        'Payoneer',
        'Skrill',
        'Neteller',
        'MPesa',
        'Bkash',
        'Cash',
        'Cheque',
        'Other'
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Client name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email format is invalid';
        }

        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Phone number format is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                        {client ? 'Edit Client' : 'Add New Client'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Client Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Enter client name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Company</label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                className="input"
                                placeholder="Company name (optional)"
                            />
                        </div>

                        <div>
                            <label className="label">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`input ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="client@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="label">Company Email</label>
                            <input
                                type="email"
                                value={formData.company_email}
                                onChange={(e) => setFormData({...formData, company_email: e.target.value})}
                                className="input"
                                placeholder="company@example.com (optional)"
                            />
                        </div>

                        <div>
                            <label className="label">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                                placeholder="+1 234 567 8900"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="label">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                className="input"
                                placeholder="Country"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Payment Mode</label>
                            <select
                                value={formData.payment_mode}
                                onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}
                                className="input"
                            >
                                {paymentModes.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                className="input h-20 resize-none"
                                placeholder="Additional notes about the client..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
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
                            {isLoading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientsPage = ({ onNavigate }) => {
    const { formatAmount } = useCurrency();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    
    // Modal states
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        // Filter clients based on search term
        const filtered = clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        );
        setFilteredClients(filtered);
    }, [clients, searchTerm]);

    const loadClients = async () => {
        try {
            const clientsData = await clientService.getClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClient = async (clientData) => {
        setModalLoading(true);
        try {
            if (selectedClient) {
                await clientService.updateClient(selectedClient.id, clientData);
            } else {
                await clientService.createClient(clientData);
            }
            await loadClients();
            setShowClientModal(false);
            setSelectedClient(null);
        } catch (error) {
            console.error('Failed to save client:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewClient = async (client) => {
        alert(`View details for ${client.name} - Full client details will be implemented next!`);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleDeleteClient = async (client) => {
        if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
            try {
                await clientService.deleteClient(client.id);
                await loadClients();
            } catch (error) {
                console.error('Failed to delete client:', error);
            }
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black">Clients</h1>
                    <p className="text-gray-600 mt-1">Manage your client relationships and contact information.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedClient(null);
                        setShowClientModal(true);
                    }}
                    className="btn-primary mt-4 sm:mt-0"
                >
                    <PlusIcon className="w-5 h-5 inline mr-2" />
                    Add Client
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search clients by name, email, company, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                />
            </div>

            {/* Client Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        onEdit={handleEditClient}
                        onView={handleViewClient}
                        onDelete={handleDeleteClient}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>

            {filteredClients.length === 0 && !loading && (
                <div className="text-center py-12">
                    <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {clients.length === 0 ? 'No clients yet' : 'No clients found'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {clients.length === 0 
                            ? 'Get started by adding your first client.'
                            : 'Try adjusting your search terms.'
                        }
                    </p>
                    {clients.length === 0 && (
                        <button
                            onClick={() => {
                                setSelectedClient(null);
                                setShowClientModal(true);
                            }}
                            className="btn-primary"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Add Your First Client
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            <ClientModal
                client={selectedClient}
                isOpen={showClientModal}
                onClose={() => {
                    setShowClientModal(false);
                    setSelectedClient(null);
                }}
                onSave={handleSaveClient}
                isLoading={modalLoading}
            />
        </div>
    );
};

export default ClientsPage;