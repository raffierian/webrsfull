import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedPatientRouteProps {
    children: React.ReactNode;
}

const ProtectedPatientRoute = ({ children }: ProtectedPatientRouteProps) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token || !userStr) {
        return <Navigate to="/patient/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'PATIENT') {
            // For now, allow other roles too or redirect to their dashboard?
            // If we strict check:
            // return <Navigate to="/patient/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/patient/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedPatientRoute;
