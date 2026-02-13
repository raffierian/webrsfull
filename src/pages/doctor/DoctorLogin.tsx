import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const DoctorLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const loginMutation = useMutation({
        mutationFn: (credentials: { username: string; password: string }) =>
            api.auth.login(credentials),
        onSuccess: (data) => {
            // Store token and user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Verify user is a doctor
            if (data.user?.role === 'DOCTOR' || data.user?.doctor) {
                toast.success(`Selamat datang, Dr. ${data.user.name}!`);
                navigate('/doctor/consultations');
            } else {
                // Not a doctor - clear token and show error
                localStorage.removeItem('token');
                toast.error('Akun ini bukan akun dokter. Silakan gunakan akun dokter yang valid.');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Login gagal. Periksa username dan password Anda.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            toast.error('Username dan password harus diisi');
            return;
        }

        loginMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Portal Dokter</CardTitle>
                    <CardDescription>
                        Masuk untuk mengelola konsultasi pasien
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username atau Email</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="username atau email@example.com"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loginMutation.isPending}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loginMutation.isPending}
                                    autoComplete="current-password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                            >
                                Lupa Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Masuk'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Login lainnya</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-center">
                            <Link
                                to="/patient/login"
                                className="text-teal-600 hover:text-teal-700 hover:underline"
                            >
                                Login sebagai Pasien
                            </Link>
                            <Link
                                to="/admin/login"
                                className="text-slate-600 hover:text-slate-700 hover:underline"
                            >
                                Login sebagai Admin
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Untuk Dokter:</strong> Gunakan akun yang telah didaftarkan oleh admin.
                            Hubungi admin jika belum memiliki akun.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorLogin;
