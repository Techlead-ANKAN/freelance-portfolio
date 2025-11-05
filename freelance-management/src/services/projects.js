import { supabase, logActivity, calculatePaymentFields, storageService } from '../lib/supabase';

export const projectService = {
    async createProject(projectData) {
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    ...projectData,
                    resources: projectData.resources || []
                })
                .select()
                .single();
            
            if (error) throw error;
            
            await logActivity('project', project.id, 'created', projectData);
            return project;
        } catch (error) {
            throw new Error('Failed to create project: ' + error.message);
        }
    },

    async getProjects(filters = {}) {
        try {
            let query = supabase.from('projects').select('*');
            
            if (filters.client_id) {
                query = query.eq('client_id', filters.client_id);
            }
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            const { data: projects, error } = await query;
            if (error) throw error;
            
            return projects || [];
        } catch (error) {
            throw new Error('Failed to fetch projects: ' + error.message);
        }
    },

    async getProject(projectId) {
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            
            if (error) throw error;
            return project;
        } catch (error) {
            throw new Error('Failed to fetch project: ' + error.message);
        }
    },

    async updateProject(projectId, updateData) {
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', projectId)
                .select()
                .single();
            
            if (error) throw error;
            
            await logActivity('project', projectId, 'updated', updateData);
            return project;
        } catch (error) {
            throw new Error('Failed to update project: ' + error.message);
        }
    },

    async deleteProject(projectId) {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);
            
            if (error) throw error;
            
            await logActivity('project', projectId, 'deleted');
            return true;
        } catch (error) {
            throw new Error('Failed to delete project: ' + error.message);
        }
    },

    async addResource(projectId, resource) {
        try {
            const project = await this.getProject(projectId);
            const updatedResources = [...(project.resources || []), {
                id: crypto.randomUUID(),
                ...resource,
            }];

            const updatedProject = await this.updateProject(projectId, {
                resources: updatedResources
            });

            await logActivity('project', projectId, 'added_resource', resource);
            return updatedProject;
        } catch (error) {
            throw new Error('Failed to add resource: ' + error.message);
        }
    },

    async getProjectsByClient(clientId) {
        try {
            return await this.getProjects({ client_id: clientId });
        } catch (error) {
            throw new Error('Failed to fetch client projects: ' + error.message);
        }
    }
};