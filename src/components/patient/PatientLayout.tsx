import { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Heart,
    LayoutDashboard,
    Calendar,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { useSettings } from "@/hooks/useSettings";

const PatientLayout = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Session Check
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            navigate('/patient/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'PATIENT') {
                // If logged in as admin/doctor, maybe irrelevant for patient portal?
                // For now, strict check: MUST be PATIENT role, or at least have a valid token.
                // Actually, sometimes Admin wants to see it? Let's just enforce Login for now.
                // navigate('/patient/login'); 
            }
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/patient/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/patient/login');
    };

    const menuItems = [
        { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/patient/appointments', label: 'Janji Temu Saya', icon: Calendar },
        { path: '/patient/profile', label: 'Profil Saya', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
                <div className="p-6 border-b flex items-center gap-3">
                    {settings?.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white p-1 border">
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-primary">Portal Pasien</h1>
                        <p className="text-xs text-muted-foreground">{settings?.name || "RS Soewandhie"}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 mr-3" />
                        Keluar
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <Heart className="w-6 h-6 text-primary" />
                        )}
                        <span className="font-bold">Portal Pasien</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-b p-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                        <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                            <LogOut className="w-5 h-5 mr-3" />
                            Keluar
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    <Outlet />
                    <footer className="py-6 text-center text-[10px] text-muted-foreground/60">
                        <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
                        <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default PatientLayout;
