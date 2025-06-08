import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('userName');
    
    useEffect(() => {
        if (!isAuthenticated) {
            alert('يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة');
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute; 