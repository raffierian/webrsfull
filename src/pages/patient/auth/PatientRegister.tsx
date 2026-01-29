import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const registerMutation = useMutation({
        mutationFn: (data: any) => api.auth.register({
            ...data,
            username: data.email, // Use email as username
            role: 'PATIENT'
        }),
        onSuccess: (data) => {
            toast({ title: "Pendaftaran Berhasil", description: "Silakan login dengan akun baru Anda." });
            navigate('/patient/login');
        },
        onError: (error: any) => {
            toast({
                title: "Pendaftaran Gagal",
                description: error.response?.data?.message || "Terjadi kesalahan saat mendaftar",
                variant: "destructive"
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast({ title: "Error", description: "Password tidak cocok", variant: "destructive" });
            return;
        }
        registerMutation.mutate({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Hero/Banner (Same as Login) */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
                <div className="absolute inset-0 hero-pattern opacity-20" />

                <div className="relative z-10 max-w-lg">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Bergabung dengan Portal Pasien</h1>
                    <p className="text-lg text-white/80 leading-relaxed mb-8">
                        Nikmati kemudahan akses layanan kesehatan. Pendaftaran cepat, mudah, dan gratis.
                    </p>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex flex-col items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Link to="/patient/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Login
                    </Link>

                    <div>
                        <h2 className="text-3xl font-bold">Buat Akun Baru</h2>
                        <p className="text-muted-foreground mt-2">Isi data diri Anda untuk mendaftar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                placeholder="Sesuai KTP"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="08xxxxxxxxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-base mt-2" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mendaftar...
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Dengan mendaftar, Anda menyetujui <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a> kami.
                    </p>
                </div>
            </div>
            <footer className="mt-8 text-center text-[10px] text-muted-foreground/60">
                <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
                <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
            </footer>
        </div>
    );
};

export default PatientRegister;
