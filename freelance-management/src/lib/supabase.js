import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket name
export const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET_NAME;

// Helper functions
export const calculatePaymentFields = (totalAmount, advanceAmount) => {
    const total = parseFloat(totalAmount) || 0;
    const advance = parseFloat(advanceAmount) || 0;
    
    const advancePercent = total > 0 ? Math.round((advance / total) * 100 * 100) / 100 : 0;
    const remainingAmount = Math.max(0, total - advance);
    
    return {
        paid_percent: advancePercent,
        remaining_amount: remainingAmount
    };
};

// Activity logging function
export const logActivity = async (entityType, entityId, action, data = {}) => {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                action,
                data,
                user_id: 'tech-fl-ankan',
            });
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

// Storage helper functions
export const storageService = {
    // Generate folder path: services_clientName_startDate
    generateFolderPath(services, clientName, startDate) {
        const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const servicesText = Array.isArray(services) ? services.join('_') : services || 'general';
        const clientFolder = sanitizeName(clientName);
        const dateFolder = startDate ? startDate.replace(/-/g, '_') : 'no_date';
        return `${sanitizeName(servicesText)}_${clientFolder}_${dateFolder}`;
    },

    // Upload file to specific project folder
    async uploadFile(file, services, clientName, startDate, customFileName = null) {
        try {
            // For development purposes, let's try to sign in anonymously for storage access
            // or use a simple approach that bypasses RLS
            
            const folderPath = this.generateFolderPath(services, clientName, startDate);
            const fileName = customFileName || file.name;
            // Add timestamp to make filename unique
            const timestamp = Date.now();
            const uniqueFileName = `${timestamp}_${fileName}`;
            const filePath = `${folderPath}/${uniqueFileName}`;

            console.log('Uploading file:', { filePath, folderPath, fileName: uniqueFileName, bucketName: BUCKET_NAME });

            // Try upload with public access
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false // Changed to false to avoid conflicts
                });

            if (error) {
                console.error('Storage upload error:', error);
                // If RLS error, try alternative approach
                if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                    console.log('RLS policy blocking upload. Bucket may need public access or proper policies.');
                    throw new Error('Storage access denied. Please check bucket permissions.');
                } else {
                    throw error;
                }
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return {
                path: data.path,
                publicUrl,
                fileName: uniqueFileName,
                originalFileName: fileName,
                folderPath,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error('Failed to upload file: ' + error.message);
        }
    },

    // List files in a project folder
    async listFiles(services, clientName, startDate) {
        try {
            const folderPath = this.generateFolderPath(services, clientName, startDate);
            
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folderPath);

            if (error) throw error;

            return data.map(file => ({
                ...file,
                publicUrl: supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(`${folderPath}/${file.name}`).data.publicUrl
            }));
        } catch (error) {
            throw new Error('Failed to list files: ' + error.message);
        }
    },

    // Delete a file
    async deleteFile(filePath) {
        try {
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePath]);

            if (error) throw error;
            return true;
        } catch (error) {
            throw new Error('Failed to delete file: ' + error.message);
        }
    },

    // Get file public URL
    getPublicUrl(filePath) {
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
        return data.publicUrl;
    },

    // Download file
    async downloadFile(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .download(filePath);

            if (error) throw error;
            return data;
        } catch (error) {
            throw new Error('Failed to download file: ' + error.message);
        }
    }
};