import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const InvoiceModal = ({ isOpen, onClose, onSave, project, client, isLoading = false, editingInvoice = null }) => {
    const [formData, setFormData] = useState({
        invoice_type: 'advance',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
        amount: '',
        description: '',
        payment_method: 'UPI',
        currency: 'INR', // Default to INR
        payment_terms: '15 days from invoice date',
        notes: '',
        services: [
            {
                description: '',
                quantity: 1,
                rate: '',
                amount: ''
            }
        ]
    });

    // Effect to populate form when editing
    useEffect(() => {
        if (editingInvoice) {
            setFormData({
                invoice_type: editingInvoice.invoice_type || 'advance',
                invoice_date: editingInvoice.invoice_date || new Date().toISOString().split('T')[0],
                due_date: editingInvoice.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: editingInvoice.amount || '',
                description: editingInvoice.description || '',
                payment_method: editingInvoice.payment_method || 'UPI',
                currency: editingInvoice.currency || 'INR',
                payment_terms: editingInvoice.payment_terms || '15 days from invoice date',
                notes: editingInvoice.notes || '',
                services: editingInvoice.services || [
                    {
                        description: '',
                        quantity: 1,
                        rate: '',
                        amount: ''
                    }
                ]
            });
        } else {
            // Reset form for new invoice
            setFormData({
                invoice_type: 'advance',
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: '',
                description: '',
                payment_method: 'UPI',
                currency: 'INR',
                payment_terms: '15 days from invoice date',
                notes: '',
                services: [
                    {
                        description: '',
                        quantity: 1,
                        rate: '',
                        amount: ''
                    }
                ]
            });
        }
    }, [editingInvoice, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.amount) {
            alert('Please enter the invoice amount');
            return;
        }

        const invoiceData = {
            ...formData,
            project_id: project.id,
            client_id: client.id,
            amount: parseFloat(formData.amount),
            services: formData.services.filter(s => s.description && s.rate)
        };

        onSave(invoiceData);
    };

    const addService = () => {
        setFormData({
            ...formData,
            services: [
                ...formData.services,
                { description: '', quantity: 1, rate: '', amount: '' }
            ]
        });
    };

    const removeService = (index) => {
        const newServices = formData.services.filter((_, i) => i !== index);
        setFormData({ ...formData, services: newServices });
    };

    const updateService = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index] = { ...newServices[index], [field]: value };
        
        // Auto-calculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
            const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newServices[index].quantity) || 0;
            const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(newServices[index].rate) || 0;
            newServices[index].amount = (quantity * rate).toFixed(2);
        }
        
        setFormData({ ...formData, services: newServices });
        
        // Auto-calculate total amount
        const totalAmount = newServices.reduce((sum, service) => {
            return sum + (parseFloat(service.amount) || 0);
        }, 0);
        
        if (totalAmount > 0) {
            setFormData(prev => ({ ...prev, amount: totalAmount.toFixed(2), services: newServices }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                        {editingInvoice ? 'Edit Invoice' : 'Create Invoice'} - {project.title}
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
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Invoice Type</label>
                                    <select
                                        value={formData.invoice_type}
                                        onChange={(e) => setFormData({...formData, invoice_type: e.target.value})}
                                        className="input"
                                        required
                                    >
                                        <option value="advance">Advance Payment</option>
                                        <option value="final">Final Payment</option>
                                        <option value="partial">Partial Payment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Payment Method</label>
                                    <select
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                        className="input"
                                        required
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Stripe">Stripe</option>
                                        <option value="Razorpay">Razorpay</option>
                                        <option value="Paytm">Paytm</option>
                                        <option value="PhonePe">PhonePe</option>
                                        <option value="Google Pay">Google Pay</option>
                                        <option value="Apple Pay">Apple Pay</option>
                                        <option value="Crypto (USDT)">Crypto (USDT)</option>
                                        <option value="Crypto (Bitcoin)">Crypto (Bitcoin)</option>
                                        <option value="Crypto (Ethereum)">Crypto (Ethereum)</option>
                                        <option value="Wire Transfer">Wire Transfer</option>
                                        <option value="Western Union">Western Union</option>
                                        <option value="MoneyGram">MoneyGram</option>
                                        <option value="Wise (formerly TransferWise)">Wise (formerly TransferWise)</option>
                                        <option value="Payoneer">Payoneer</option>
                                        <option value="Skrill">Skrill</option>
                                        <option value="Neteller">Neteller</option>
                                        <option value="MPesa">MPesa</option>
                                        <option value="Bkash">Bkash</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                        className="input"
                                        required
                                    >
                                        <option value="INR">₹ Indian Rupee (INR)</option>
                                        <option value="USD">$ US Dollar (USD)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Invoice Date</label>
                                    <input
                                        type="date"
                                        value={formData.invoice_date}
                                        onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="input"
                                    rows="3"
                                    placeholder="Brief description of work/services"
                                />
                            </div>

                            <div>
                                <label className="label">Payment Terms</label>
                                <input
                                    type="text"
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                                    className="input"
                                    placeholder="e.g., 15 days from invoice date"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="label">Services/Items</label>
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="btn-secondary text-sm"
                                    >
                                        <PlusIcon className="w-4 h-4 inline mr-1" />
                                        Add Item
                                    </button>
                                </div>
                                
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {formData.services.map((service, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                                                {formData.services.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeService(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Service description"
                                                    value={service.description}
                                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                                    className="input text-sm"
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={service.quantity}
                                                        onChange={(e) => updateService(index, 'quantity', e.target.value)}
                                                        className="input text-sm"
                                                        min="1"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder={`Rate (${formData.currency === 'USD' ? '$' : '₹'})`}
                                                        value={service.rate}
                                                        onChange={(e) => updateService(index, 'rate', e.target.value)}
                                                        className="input text-sm"
                                                        step="0.01"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder={`Amount (${formData.currency === 'USD' ? '$' : '₹'})`}
                                                        value={service.amount}
                                                        className="input text-sm bg-gray-50"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Total Amount ({formData.currency === 'USD' ? '$' : '₹'})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="input text-lg font-semibold"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="input"
                                    rows="3"
                                    placeholder="Additional notes or terms"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Client & Project Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Client:</span> {client.name}
                                {client.company && <span> ({client.company})</span>}
                            </div>
                            <div>
                                <span className="font-medium">Project:</span> {project.title}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
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
                            {isLoading ? (editingInvoice ? 'Updating...' : 'Creating...') : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceModal;