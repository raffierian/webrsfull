import { useLocation } from 'react-router-dom';

export const Footer = () => {
    const location = useLocation();
    const isHidden = location.pathname.startsWith('/admin') || location.pathname.startsWith('/patient');

    if (isHidden) return null;

    return (
        <footer className="py-6 text-center text-[10px] text-muted-foreground/60 bg-gray-50 border-t z-50 relative">
            <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
            <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
        </footer>
    );
};
