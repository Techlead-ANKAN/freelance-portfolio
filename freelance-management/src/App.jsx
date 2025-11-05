import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { projectService } from './services/projects';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [currentPageParams, setCurrentPageParams] = useState(null);

    const handleNavigate = (page, params = null) => {
        setCurrentPage(page);
        setCurrentPageParams(params);
    };
    
    const clearParams = () => {
        setCurrentPageParams(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage onNavigate={handleNavigate} />;
            case 'clients':
                return <ClientsPage onNavigate={handleNavigate} />;
            case 'projects':
                return <ProjectsPage onNavigate={handleNavigate} params={currentPageParams} onClearParams={clearParams} />;
            case 'settings':
                return <SettingsPage />;
            case 'client-detail':
                return (
                    <ClientDetailPage
                        clientId={currentPageParams?.clientId}
                        onBack={() => handleNavigate('clients')}
                        onEdit={(client) => {
                            // TODO: Implement client edit modal/form
                            console.log('Edit client:', client);
                        }}
                        onDelete={(client) => {
                            // TODO: Implement client delete confirmation
                            console.log('Delete client:', client);
                        }}
                        onNavigateToProject={(projectId) => 
                            handleNavigate('project-detail', { projectId })
                        }
                    />
                );
            case 'project-detail':
                return (
                    <ProjectDetailPage
                        projectId={currentPageParams?.projectId}
                        onBack={() => handleNavigate('projects')}
                        onEdit={(project) => {
                            handleNavigate('projects', { editProject: project });
                        }}
                        onDelete={async (project) => {
                            if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
                                try {
                                    await projectService.deleteProject(project.id);
                                    handleNavigate('projects');
                                } catch (error) {
                                    alert('Failed to delete project: ' + error.message);
                                }
                            }
                        }}
                    />
                );
            default:
                return <DashboardPage onNavigate={handleNavigate} />;
        }
    };

    return (
        <Layout currentPage={currentPage} onPageChange={handleNavigate}>
            {renderPage()}
        </Layout>
    );
};

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <AppContent />
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;
