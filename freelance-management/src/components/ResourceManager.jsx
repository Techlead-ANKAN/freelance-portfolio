import React, { useState } from 'react';
import FileUpload from './FileUpload';
import {
    PlusIcon,
    LinkIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const ResourceManager = ({
    services,
    clientName,
    startDate,
    resources = [],
    onResourcesChange,
    isEditing = true
}) => {
    const [showAddLink, setShowAddLink] = useState(false);
    const [linkForm, setLinkForm] = useState({
        title: '',
        url: '',
        note: ''
    });

    const uploadedFiles = resources.filter(r => r.type === 'uploaded');
    const linkResources = resources.filter(r => r.type !== 'uploaded');

    const handleAddLink = () => {
        if (!linkForm.title || !linkForm.url) {
            alert('Please provide both title and URL');
            return;
        }

        // Validate URL format
        try {
            new URL(linkForm.url);
        } catch {
            alert('Please provide a valid URL');
            return;
        }

        const newResource = {
            id: crypto.randomUUID(),
            title: linkForm.title,
            url: linkForm.url,
            type: 'link',
            note: linkForm.note
        };

        const updatedResources = [...resources, newResource];
        onResourcesChange(updatedResources);

        // Reset form
        setLinkForm({ title: '', url: '', note: '' });
        setShowAddLink(false);
    };

    const handleFileUploaded = (fileData) => {
        const updatedResources = [...resources, fileData];
        onResourcesChange(updatedResources);
    };

    const handleFileDeleted = (fileToDelete) => {
        const updatedResources = resources.filter(r => r.id !== fileToDelete.id);
        onResourcesChange(updatedResources);
    };

    const handleDeleteResource = (resourceId) => {
        const resource = resources.find(r => r.id === resourceId);
        if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
            const updatedResources = resources.filter(r => r.id !== resourceId);
            onResourcesChange(updatedResources);
        }
    };

    const detectLinkType = (url) => {
        if (url.includes('drive.google.com')) return 'Google Drive';
        if (url.includes('dropbox.com')) return 'Dropbox';
        if (url.includes('onedrive.live.com')) return 'OneDrive';
        if (url.includes('github.com')) return 'GitHub';
        return 'External Link';
    };

    return (
        <div className="space-y-6">
            {/* File Upload Section */}
            {isEditing && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Upload Files</h4>
                    <FileUpload
                        services={services}
                        clientName={clientName}
                        startDate={startDate}
                        existingFiles={uploadedFiles}
                        onFileUploaded={handleFileUploaded}
                        onFileDeleted={handleFileDeleted}
                    />
                </div>
            )}

            {/* Links Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Resource Links</h4>
                    {isEditing && (
                        <button
                            onClick={() => setShowAddLink(true)}
                            className="btn-secondary text-sm"
                        >
                            <PlusIcon className="w-4 h-4 inline mr-1" />
                            Add Link
                        </button>
                    )}
                </div>

                {/* Add Link Form */}
                {showAddLink && (
                    <div className="card p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Add Resource Link</h5>
                            <button
                                onClick={() => setShowAddLink(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="label">Title *</label>
                                <input
                                    type="text"
                                    value={linkForm.title}
                                    onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
                                    className="input"
                                    placeholder="e.g., Design Files, Requirements Document"
                                />
                            </div>

                            <div>
                                <label className="label">URL *</label>
                                <input
                                    type="url"
                                    value={linkForm.url}
                                    onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
                                    className="input"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div>
                                <label className="label">Note (Optional)</label>
                                <textarea
                                    value={linkForm.note}
                                    onChange={(e) => setLinkForm({...linkForm, note: e.target.value})}
                                    className="input h-20 resize-none"
                                    placeholder="Additional notes about this resource..."
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowAddLink(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLink}
                                    className="btn-primary"
                                >
                                    Add Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Links List */}
                <div className="space-y-2">
                    {linkResources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                                <GlobeAltIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-gray-900">{resource.title}</p>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {detectLinkType(resource.url)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{resource.url}</p>
                                    {resource.note && (
                                        <p className="text-sm text-gray-500 mt-1">{resource.note}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Open link"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                                
                                {isEditing && (
                                    <button
                                        onClick={() => handleDeleteResource(resource.id)}
                                        className="p-1 text-gray-400 hover:text-red-600"
                                        title="Delete resource"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {linkResources.length === 0 && !showAddLink && (
                    <div className="text-center py-8 text-gray-500">
                        <GlobeAltIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>No resource links added yet</p>
                        {isEditing && (
                            <button
                                onClick={() => setShowAddLink(true)}
                                className="btn-primary mt-2"
                            >
                                Add Your First Link
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Resources Summary */}
            {(uploadedFiles.length > 0 || linkResources.length > 0) && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Resources Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Uploaded Files:</span>
                            <span className="ml-2 font-medium">{uploadedFiles.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">External Links:</span>
                            <span className="ml-2 font-medium">{linkResources.length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceManager;