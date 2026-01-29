import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from "@/hooks/useSettings";

const PatientLogin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const loginMutation = useMutation({
        mutationFn: (data: any) => api.auth.login({
            username: data.email, // Backend expects 'username', mapping email to it
            password: data.password
        }),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'PATIENT') {
                toast({ title: "Login Berhasil", description: "Selamat datang kembali!" });
                navigate('/patient/dashboard');
            } else {
                toast({ title: "Akses Ditolak", description: "Akun ini bukan akun pasien.", variant: "destructive" });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        onError: (error: any) => {
            toast({
                title: "Login Gagal",
                description: error.response?.data?.message || "Email atau password salah",
                variant: "destructive"
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Hero/Banner */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
                <div className="absolute inset-0 hero-pattern opacity-20" />

                <div className="relative z-10 max-w-lg">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm p-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <Heart className="w-8 h-8 text-primary" />
                        )}
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Portal Pasien {settings?.name || "RS Soewandhie"}</h1>
                    <p className="text-lg text-white/80 leading-relaxed mb-8">
                        Kelola kesehatan Anda dengan mudah. Buat janji temu, pantau riwayat medis, dan akses layanan kesehatan dalam satu genggaman.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <h3 className="font-bold text-xl mb-1">24/7</h3>
                            <p className="text-sm text-white/70">Akses Kapan Saja</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <h3 className="font-bold text-xl mb-1">Aman</h3>
                            <p className="text-sm text-white/70">Data Terenkripsi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex flex-col items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Beranda
                    </Link>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold">Selamat Datang</h2>
                        <p className="text-muted-foreground mt-2">Masuk untuk mengakses layanan pasien</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                    Lupa password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-base" disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Masuk...
                                </>
                            ) : (
                                'Masuk ke Portal'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Belum punya akun?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/patient/register">
                            <Button variant="outline" className="w-full h-12">
                                Daftar Akun Baru
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <footer className="mt-8 text-center text-[10px] text-muted-foreground/60">
                <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
                <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
            </footer>
        </div>

    );
};

export default PatientLogin;
