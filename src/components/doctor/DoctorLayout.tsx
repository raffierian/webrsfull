import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const DoctorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get doctor info
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => api.auth.me()
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const navItems = [
        { path: '/doctor/consultations', icon: MessageSquare, label: 'Konsultasi' },
        { path: '/doctor/profile', icon: User, label: 'Profil' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Header - Mobile & Desktop */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-teal-600">Portal Dokter</h1>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                            ? 'bg-teal-50 text-teal-600 font-medium'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Keluar
                        </Button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="p-4 space-y-2">
                            <div className="pb-3 border-b">
                                <p className="text-sm text-slate-600">Halo,</p>
                                <p className="font-semibold">{user?.name || 'Dokter'}</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Keluar
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-6">
                <Outlet />
            </main>

            {/* Bottom Navigation - Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default DoctorLayout;
