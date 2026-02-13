import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const forgotMutation = useMutation({
        mutationFn: (email: string) => api.auth.forgotPassword(email),
        onSuccess: (data) => {
            toast.success(data.message || 'Kode verifikasi telah dikirim ke email Anda.');
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal mengirim kode verifikasi.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email harus diisi');
            return;
        }
        forgotMutation.mutate(email);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-teal-500">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                        <KeyRound className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
                    <CardDescription>
                        Masukkan email Anda untuk menerima kode verifikasi (OTP)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={forgotMutation.isPending}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            size="lg"
                            disabled={forgotMutation.isPending}
                        >
                            {forgotMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Kode Verifikasi'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <Link
                            to={window.location.pathname.includes('admin') ? '/admin/login' : '/patient/login'}
                            className="flex items-center text-sm text-slate-600 hover:text-teal-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
