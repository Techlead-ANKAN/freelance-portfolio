import { supabase } from '../lib/supabase';

export const invoiceService = {
    // Create a new invoice
    async createInvoice(invoiceData) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .insert([invoiceData])
                .select('*')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error(`Failed to create invoice: ${error.message}`);
        }
    },

    // Get all invoices for a project
    async getInvoicesByProject(projectId) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    projects(title),
                    clients(name, email, company)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw new Error(`Failed to fetch invoices: ${error.message}`);
        }
    },

    // Get all invoices
    async getAllInvoices() {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    projects(title),
                    clients(name, email, company)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all invoices:', error);
            throw new Error(`Failed to fetch invoices: ${error.message}`);
        }
    },

    // Get single invoice
    async getInvoice(invoiceId) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    projects(title, description, start_date, end_date),
                    clients(name, email, company, phone, address)
                `)
                .eq('id', invoiceId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching invoice:', error);
            throw new Error(`Failed to fetch invoice: ${error.message}`);
        }
    },

    // Update invoice status
    async updateInvoiceStatus(invoiceId, status) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({ status })
                .eq('id', invoiceId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating invoice status:', error);
            throw new Error(`Failed to update invoice status: ${error.message}`);
        }
    },

    // Update invoice
    async updateInvoice(invoiceId, invoiceData) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({
                    ...invoiceData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoiceId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw new Error(`Failed to update invoice: ${error.message}`);
        }
    },

    // Delete invoice
    async deleteInvoice(invoiceId) {
        try {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', invoiceId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw new Error(`Failed to delete invoice: ${error.message}`);
        }
    }
};