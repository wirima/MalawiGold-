import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const PageLoader: React.FC = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
    </div>
);


export const ProtectedRoute: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const PublicRoute: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (session) {
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
};
