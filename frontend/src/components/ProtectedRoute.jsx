import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: window.location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute; 