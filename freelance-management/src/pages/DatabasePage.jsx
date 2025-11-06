import React, { useState, useEffect } from 'react';
import { 
    TableCellsIcon, 
    UsersIcon, 
    BriefcaseIcon, 
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { clientService } from '../services/auth';
import { projectService } from '../services/projects';
import { invoiceService } from '../services/invoices';

const TableCard = ({ title, icon: Icon, count, description, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`cursor-pointer transition-all duration-200 ${
            isActive 
                ? 'card bg-black text-white shadow-lg scale-105' 
                : 'card hover:shadow-lg hover:scale-102'
        }`}
    >
        <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${
                        isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                    }`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            isActive ? 'text-white' : 'text-gray-600'
                        }`} />
                    </div>
                    <div>
                        <h3 className={`text-lg sm:text-xl font-semibold ${
                            isActive ? 'text-white' : 'text-black'
                        }`}>
                            {title}
                        </h3>
                        <p className={`text-sm ${
                            isActive ? 'text-gray-200' : 'text-gray-600'
                        }`}>
                            {description}
                        </p>
                    </div>
                </div>
                <div className={`text-right ${
                    isActive ? 'text-white' : 'text-black'
                }`}>
                    <div className="text-2xl sm:text-3xl font-bold">{count}</div>
                    <div className={`text-xs sm:text-sm ${
                        isActive ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                        Records
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DataTable = ({ data, columns, title, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    // Filter data based on search term
    const filteredData = data.filter(row =>
        columns.some(col => 
            String(row[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortColumn) return 0;
        
        const aValue = a[sortColumn] || '';
        const bValue = b[sortColumn] || '';
        
        if (sortDirection === 'asc') {
            return String(aValue).localeCompare(String(bValue));
        } else {
            return String(bValue).localeCompare(String(aValue));
        }
    });

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const exportToCSV = () => {
        const headers = columns.map(col => col.label).join(',');
        const rows = sortedData.map(row => 
            columns.map(col => `"${row[col.key] || ''}"`).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase()}-export.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-0 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-black">{title} Data</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {sortedData.length} records found
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-64"
                            />
                        </div>
                        {/* Export Button */}
                        <button
                            onClick={exportToCSV}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {sortColumn === column.key && (
                                            <span className="text-black">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length > 0 ? (
                            sortedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                                        >
                                            {column.render 
                                                ? column.render(row[column.key], row)
                                                : (row[column.key] || '-')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            {sortedData.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                        <div>
                            Showing {sortedData.length} of {data.length} records
                        </div>
                        {searchTerm && (
                            <div>
                                Filtered by: "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DatabasePage = () => {
    const [activeTable, setActiveTable] = useState('clients');
    const [data, setData] = useState({
        clients: [],
        projects: [],
        invoices: []
    });
    const [loading, setLoading] = useState({
        clients: false,
        projects: false,
        invoices: false
    });
    const [counts, setCounts] = useState({
        clients: 0,
        projects: 0,
        invoices: 0
    });

    // Table configurations
    const tableConfigs = {
        clients: {
            title: 'Clients',
            icon: UsersIcon,
            description: 'Manage your client database',
            columns: [
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'country', label: 'Country' }
            ]
        },
        projects: {
            title: 'Projects',
            icon: BriefcaseIcon,
            description: 'Track all your projects',
            columns: [
                { key: 'id', label: 'Project ID' },
                { key: 'title', label: 'Project Title' },
                { key: 'services', label: 'Services', render: (value) => Array.isArray(value) ? value.join(', ') : value },
                { key: 'status', label: 'Status', render: (value) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === 'completed' ? 'bg-green-100 text-green-800' :
                        value === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        value === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {value || 'Unknown'}
                    </span>
                )},
                { key: 'total_amount', label: 'Total Amount', render: (value) => value ? `₹${value.toLocaleString()}` : '₹0' },
                { key: 'paid_amount', label: 'Paid Amount', render: (value) => value ? `₹${value.toLocaleString()}` : '₹0' },
                { key: 'remaining_amount', label: 'Remaining Amount', render: (value) => value ? `₹${value.toLocaleString()}` : '₹0' },
                { key: 'client_name', label: 'Client Name' }
            ]
        },
        invoices: {
            title: 'Invoices',
            icon: DocumentTextIcon,
            description: 'View all invoices',
            columns: [
                { key: 'project_id', label: 'Project ID' },
                { key: 'client_id', label: 'Client ID' },
                { key: 'invoice_number', label: 'Invoice Number' },
                { key: 'amount', label: 'Amount', render: (value, row) => {
                    const currency = row.currency || '₹';
                    return value ? `${currency}${value.toLocaleString()}` : `${currency}0`;
                }},
                { key: 'status', label: 'Status', render: (value) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === 'paid' ? 'bg-green-100 text-green-800' :
                        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        value === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {value || 'Unknown'}
                    </span>
                )},
                { key: 'currency', label: 'Currency' }
            ]
        }
    };

    // Load data for specific table
    const loadTableData = async (tableName) => {
        setLoading(prev => ({ ...prev, [tableName]: true }));
        
        try {
            let tableData = [];
            
            switch (tableName) {
                case 'clients':
                    tableData = await clientService.getClients();
                    break;
                case 'projects':
                    const projects = await projectService.getProjects();
                    const clients = await clientService.getClients();
                    
                    // Enhance projects with client names
                    tableData = projects.map(project => ({
                        ...project,
                        client_name: clients.find(client => client.id === project.client_id)?.name || 'Unknown'
                    }));
                    break;
                case 'invoices':
                    tableData = await invoiceService.getAllInvoices();
                    break;
                default:
                    tableData = [];
            }
            
            setData(prev => ({ ...prev, [tableName]: tableData }));
            setCounts(prev => ({ ...prev, [tableName]: tableData.length }));
        } catch (error) {
            console.error(`Failed to load ${tableName} data:`, error);
            setData(prev => ({ ...prev, [tableName]: [] }));
            setCounts(prev => ({ ...prev, [tableName]: 0 }));
        } finally {
            setLoading(prev => ({ ...prev, [tableName]: false }));
        }
    };

    // Load initial counts for all tables
    const loadAllCounts = async () => {
        try {
            const [clients, projects, invoices] = await Promise.all([
                clientService.getClients(),
                projectService.getProjects(),
                invoiceService.getAllInvoices()
            ]);
            
            setCounts({
                clients: clients.length,
                projects: projects.length,
                invoices: invoices.length
            });
        } catch (error) {
            console.error('Failed to load table counts:', error);
        }
    };

    useEffect(() => {
        loadAllCounts();
        loadTableData(activeTable);
    }, []);

    useEffect(() => {
        loadTableData(activeTable);
    }, [activeTable]);

    const currentTableConfig = tableConfigs[activeTable];
    const currentData = data[activeTable];
    const isLoading = loading[activeTable];

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Database</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Manage and view your database tables
                    </p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <TableCellsIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                        {Object.values(counts).reduce((sum, count) => sum + count, 0)} Total Records
                    </span>
                </div>
            </div>

            {/* Table Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(tableConfigs).map(([key, config]) => (
                    <TableCard
                        key={key}
                        title={config.title}
                        icon={config.icon}
                        count={counts[key]}
                        description={config.description}
                        isActive={activeTable === key}
                        onClick={() => setActiveTable(key)}
                    />
                ))}
            </div>

            {/* Selected Table Data */}
            {currentTableConfig && (
                <DataTable
                    data={currentData}
                    columns={currentTableConfig.columns}
                    title={currentTableConfig.title}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default DatabasePage;