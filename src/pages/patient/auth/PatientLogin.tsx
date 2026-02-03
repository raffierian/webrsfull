import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, ArrowLeft, ShieldCheck, Clock, Activity, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from "@/hooks/useSettings";
import { motion } from 'framer-motion';

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
                description: error.data?.message || error.message || "Email atau password salah", // Improved error handling
                variant: "destructive"
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50">
            {/* Left: Hero/Banner - Premium Medical Design */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0F766E] text-white relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                            ) : (
                                <Heart className="w-5 h-5 text-white" fill="currentColor" />
                            )}
                        </div>
                        <span className="font-semibold text-lg tracking-wide uppercase opacity-90">RS Soewandhie</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl"
                    >
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Layanan Kesehatan <br /> <span className="text-teal-200">Dalam Genggaman</span>
                        </h1>
                        <p className="text-lg text-teal-50/90 leading-relaxed max-w-md mb-10">
                            Akses rekam medis, buat janji temu dokter, dan pantau kesehatan keluarga Anda dengan platform digital yang aman dan terintegrasi.
                        </p>

                        <div className="flex gap-4">
                            {[
                                { icon: Clock, label: "24/7 Akses", desc: "Kapanpun Dimanapun" },
                                { icon: ShieldCheck, label: "Data Aman", desc: "Enkripsi End-to-End" },
                                { icon: Activity, label: "Real-time", desc: "Update Status Medis" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/15 transition-colors cursor-default">
                                    <item.icon className="w-8 h-8 text-teal-200 mb-3" />
                                    <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                                    <p className="text-xs text-teal-100/70">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 flex justify-between items-end text-xs text-teal-100/60 font-light">
                    <p>© 2026 RS Soewandhie. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>

            {/* Right: Login Form - Glassmorphism & Clean */}
            <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-[440px] relative z-10">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#0F766E] transition-colors mb-8 group">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-2 group-hover:bg-teal-50 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Kembali ke Beranda
                    </Link>

                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang 👋</h2>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                Silakan masuk dengan email terdaftar Anda untuk mengakses Portal Pasien.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E]/20 rounded-xl transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</Label>
                                    <Link to="/forgot-password" className="text-xs font-medium text-[#0F766E] hover:text-[#0d655e] hover:underline">
                                        Lupa Password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E]/20 rounded-xl transition-all font-medium text-slate-900"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#0F766E] hover:bg-[#0d655e] text-white rounded-xl font-semibold shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Masuk Sekarang <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500 mb-4">Belum memiliki akun pasien?</p>
                            <Link to="/patient/register">
                                <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0F766E] hover:border-[#0F766E]/30 transition-all font-semibold">
                                    Daftar Akun Baru
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile-only footer */}
                <div className="lg:hidden mt-8 text-center text-[10px] text-slate-400">
                    <p>&copy; {new Date().getFullYear()} RS Soewandhie. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;
