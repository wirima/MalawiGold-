import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const PageLoader: React.FC = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
    </div>
);

export const ProtectedRoute: React.FC = () => {
    const { session, currentUser, loading } = useAuth();
    if (loading) return <PageLoader />;
    
    if (!session || !currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    if (currentUser.account_status === 'active' && !currentUser.onboarding_complete) {
        return <Navigate to="/onboarding/welcome" replace />;
    }
    
    // For demo (session is always present) or active users, show the app
    return <Outlet />;
};


export const OnboardingRoute: React.FC = () => {
    const { session, currentUser, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!session || !currentUser) return <Navigate to="/login" replace />;

    // If already onboarded, go to app
    if (currentUser.onboarding_complete) {
        return <Navigate to="/app" replace />;
    }

    // Allow access if status is 'onboarding_pending'
    if (currentUser.account_status === 'onboarding_pending') {
        return <Outlet />;
    }
    
    // If they are just in trial, they need to subscribe first
    return <Navigate to="/subscription" replace />;
}

export const PublicRoute: React.FC = () => {
    const { session, currentUser, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (session && currentUser) {
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
};
