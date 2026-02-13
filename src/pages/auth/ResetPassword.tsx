import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        code: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!formData.email) {
            toast.error('Email tidak ditemukan. Silakan ulangi proses lupa password.');
            navigate('/forgot-password');
        }
    }, [formData.email, navigate]);

    const resetMutation = useMutation({
        mutationFn: (data: any) => api.auth.resetPassword(data),
        onSuccess: () => {
            setIsSuccess(true);
            toast.success('Password berhasil direset. Silakan login kembali.');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal mereset password. Pastikan kode verifikasi benar.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.newPassword) {
            toast.error('Semua field harus diisi');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }

        resetMutation.mutate({
            email: formData.email,
            code: formData.code,
            newPassword: formData.newPassword
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl text-center p-6 border-t-4 border-t-green-500">
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">Password Diperbarui!</CardTitle>
                    <p className="text-slate-600 mb-8">
                        Password Anda telah berhasil diubah. Sekarang Anda dapat login dengan password baru Anda.
                    </p>
                    <Button
                        onClick={() => navigate('/patient/login')}
                        className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                        Ke Halaman Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-teal-500">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Atur Ulang Password</CardTitle>
                    <CardDescription>
                        Masukkan kode verifikasi yang dikirim ke <strong>{formData.email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode Verifikasi (OTP)</Label>
                            <Input
                                id="code"
                                name="code"
                                type="text"
                                placeholder="6 digit kode"
                                className="text-center text-2xl tracking-[0.5em] font-bold"
                                maxLength={6}
                                value={formData.code}
                                onChange={handleChange}
                                disabled={resetMutation.isPending}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    disabled={resetMutation.isPending}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={resetMutation.isPending}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 mt-2"
                            size="lg"
                            disabled={resetMutation.isPending}
                        >
                            {resetMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
