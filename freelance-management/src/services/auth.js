import { supabase, logActivity } from '../lib/supabase';

export const authService = {
    // Login with hardcoded credentials and create Supabase session
    async login(email, password) {
        try {
            // For development, we'll use hardcoded credentials
            if (email === 'tech-fl-ankan@local' && password === 'Tech-fl-ankan') {
                // Try to sign in with Supabase using a demo account
                // If no demo account exists, we'll create a session manually
                try {
                    // Try anonymous sign in for storage access
                    const { data, error } = await supabase.auth.signInAnonymously();
                    if (error) {
                        console.log('Anonymous sign in failed:', error);
                        // Fall back to mock session
                    } else {
                        console.log('Anonymous auth successful:', data);
                    }
                } catch (authError) {
                    console.log('Auth error:', authError);
                }

                // Create a mock session for development
                const mockUser = {
                    id: 'tech-fl-ankan',
                    email: 'tech-fl-ankan@local',
                    name: 'Tech FL Ankan'
                };
                localStorage.setItem('supabase_user', JSON.stringify(mockUser));
                return mockUser;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    async logout() {
        try {
            // Sign out from Supabase if signed in
            await supabase.auth.signOut();
            localStorage.removeItem('supabase_user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    async getCurrentUser() {
        try {
            const user = localStorage.getItem('supabase_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    },

    async createUser() {
        // Not needed for hardcoded auth
        return true;
    }
};

export const clientService = {
    async createClient(clientData) {
        try {
            const { data: client, error } = await supabase
                .from('clients')
                .insert(clientData)
                .select()
                .single();
            
            if (error) throw error;
            
            await logActivity('client', client.id, 'created', clientData);
            return client;
        } catch (error) {
            throw new Error('Failed to create client: ' + error.message);
        }
    },

    async getClients(search = '') {
        try {
            let query = supabase.from('clients').select('*');
            
            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`);
            }
            
            const { data: clients, error } = await query;
            if (error) throw error;
            
            return clients || [];
        } catch (error) {
            throw new Error('Failed to fetch clients: ' + error.message);
        }
    },

    async getClient(clientId) {
        try {
            const { data: client, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();
            
            if (error) throw error;
            return client;
        } catch (error) {
            throw new Error('Failed to fetch client: ' + error.message);
        }
    },

    async updateClient(clientId, updateData) {
        try {
            const { data: client, error } = await supabase
                .from('clients')
                .update(updateData)
                .eq('id', clientId)
                .select()
                .single();
            
            if (error) throw error;
            
            await logActivity('client', clientId, 'updated', updateData);
            return client;
        } catch (error) {
            throw new Error('Failed to update client: ' + error.message);
        }
    },

    async deleteClient(clientId) {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);
            
            if (error) throw error;
            
            await logActivity('client', clientId, 'deleted');
            return true;
        } catch (error) {
            throw new Error('Failed to delete client: ' + error.message);
        }
    }
};