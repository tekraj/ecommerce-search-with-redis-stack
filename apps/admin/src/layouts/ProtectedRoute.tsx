import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/auth-context';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) {
            return;
        }
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return <Outlet />;
}
