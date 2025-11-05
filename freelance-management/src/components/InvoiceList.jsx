import React, { useState, useEffect, useRef } from 'react';
import { 
    DocumentArrowDownIcon, 
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CloudIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { invoiceService } from '../services/invoices';
import { html2pdfService } from '../services/html2pdfService';
import InvoiceTemplate from './InvoiceTemplate';

const InvoiceList = ({ projectId, project, client, onEditInvoice }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pdfGenerating, setPdfGenerating] = useState(null); // Track which invoice is being generated
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const printableRef = useRef(null);

    useEffect(() => {
        if (projectId) {
            loadInvoices();
        }
    }, [projectId]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.getInvoicesByProject(projectId);
            setInvoices(data);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (invoice) => {
        try {
            setPdfGenerating(invoice.id);
            setSelectedInvoice({ invoice, project, client });

            // Wait a tick so the template renders into the hidden DOM node
            await new Promise((res) => setTimeout(res, 50));

            const element = printableRef.current;
            if (!element) throw new Error('Printable element not found');

            await html2pdfService.downloadInvoiceFromElement(element, `Invoice-${invoice.invoice_number}.pdf`);
        } catch (error) {
            console.error('Download failed:', error);
            alert(`Download failed: ${error.message}`);
        } finally {
            setPdfGenerating(null);
            // Clear selected after a small delay to avoid reflow issues
            setTimeout(() => setSelectedInvoice(null), 200);
        }
    };

    const handleEditInvoice = (invoice) => {
        if (onEditInvoice) {
            onEditInvoice(invoice);
        } else {
            alert('Edit functionality is not available. Please contact the developer.');
        }
    };

    const handleStatusUpdate = async (invoiceId, newStatus) => {
        try {
            await invoiceService.updateInvoiceStatus(invoiceId, newStatus);
            await loadInvoices(); // Reload to get updated data
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update invoice status');
        }
    };

    const handleDelete = async (invoiceId, invoiceNumber) => {
        if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
            try {
                await invoiceService.deleteInvoice(invoiceId);
                await loadInvoices();
            } catch (error) {
                console.error('Failed to delete invoice:', error);
                alert('Failed to delete invoice');
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'overdue':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'sent':
                return <ClockIcon className="w-5 h-5 text-blue-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading invoices...</p>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="text-center py-8">
                <DocumentArrowDownIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
                <p className="text-gray-600">Create your first invoice for this project.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Project Invoices ({invoices.length})
                </h3>
                {/* html2pdf is used client-side; no API test needed */}
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getStatusIcon(invoice.status)}
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.invoice_number}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {invoice.payment_method}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {invoice.invoice_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.currency === 'USD' 
                                            ? `$${parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : `₹${parseFloat(invoice.amount).toLocaleString('en-IN')}`
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={invoice.status}
                                            onChange={(e) => handleStatusUpdate(invoice.id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(invoice.status)}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="sent">Sent</option>
                                            <option value="paid">Paid</option>
                                            <option value="overdue">Overdue</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</div>
                                        <div className="text-xs text-gray-500">
                                            Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditInvoice(invoice)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit Invoice"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPDF(invoice)}
                                                disabled={pdfGenerating === invoice.id}
                                                className={`text-blue-600 hover:text-blue-900 disabled:opacity-50 ${
                                                    pdfGenerating === invoice.id ? 'cursor-not-allowed' : ''
                                                }`}
                                                title="Download PDF (Invoice Generator API)"
                                            >
                                                {pdfGenerating === invoice.id ? (
                                                    <CloudIcon className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <DocumentArrowDownIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Invoice"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden printable template for html2pdf */}
            <div style={{ position: 'absolute', left: -9999, top: 0, visibility: selectedInvoice ? 'visible' : 'hidden' }}>
                <div ref={printableRef}>
                    {selectedInvoice && <InvoiceTemplate data={selectedInvoice} />}
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;