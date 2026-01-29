import { Link } from 'react-router-dom';
import { Calculator, Heart, Baby, Scale, Droplets, Activity, ChevronRight, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const tools = [
    {
        id: 'bmi',
        title: 'Kalkulator BMI',
        description: 'Hitung Indeks Massa Tubuh (IMT) untuk mengetahui status berat badan Anda.',
        icon: Scale,
        path: '/tools-kesehatan/bmi',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        id: 'kalori',
        title: 'Kalkulator Kalori',
        description: 'Estimasi kebutuhan kalori harian berdasarkan aktivitas fisik Anda.',
        icon: Calculator,
        path: '/tools-kesehatan/kalori',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    {
        id: 'kehamilan',
        title: 'Kalkulator Kehamilan',
        description: 'Pantau usia kehamilan dan estimasi Hari Perkiraan Lahir (HPL).',
        icon: Baby,
        path: '/tools-kesehatan/kehamilan',
        color: 'text-pink-600',
        bg: 'bg-pink-50',
    },
    {
        id: 'berat-ideal',
        title: 'Berat Badan Ideal',
        description: 'Cari tahu berat badan optimal untuk tinggi badan Anda.',
        icon: Activity,
        path: '/tools-kesehatan/berat-ideal',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        id: 'air',
        title: 'Kebutuhan Air',
        description: 'Hitung target asupan cairan harian agar tetap terhidrasi.',
        icon: Droplets,
        path: '/tools-kesehatan/kebutuhan-air',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
    },
    {
        id: 'denyut-jantung',
        title: 'Denyut Jantung',
        description: 'Zona denyut jantung aman untuk efektivitas olahraga maksimal.',
        icon: Heart,
        path: '/tools-kesehatan/denyut-jantung',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
    },
];

export default function HealthToolsPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
                {/* Background Decoration */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Hero Section */}
                <section className="relative z-10 pt-20 pb-12 px-4">
                    <div className="container mx-auto max-w-5xl text-center">
                        <span className="inline-block animate-in fade-in zoom-in duration-700 delay-100">
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-blue-100">
                                Health Wellness Center
                            </span>
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-in slide-in-from-bottom-4 duration-700 delay-200">
                            Pantau Kesehatan Anda <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Secara Mandiri & Akurat
                            </span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                            Kumpulan kalkulator kesehatan medis standart untuk membantu Anda membuat keputusan yang lebih baik tentang gaya hidup sehat.
                        </p>
                    </div>
                </section>

                {/* Tools Grid */}
                <section className="relative z-10 pb-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tools.map((tool, index) => {
                                const Icon = tool.icon;
                                return (
                                    <Link
                                        key={tool.id}
                                        to={tool.path}
                                        className="group animate-in fade-in slide-in-from-bottom-8 duration-700"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="h-full bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">

                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-blue-50/0 group-hover:from-white/50 group-hover:to-blue-50/30 transition-colors duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12", tool.bg)}>
                                                        <Icon className={cn("w-7 h-7", tool.color)} />
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                    {tool.title}
                                                </h3>
                                                <p className="text-slate-500 text-sm leading-relaxed">
                                                    {tool.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Health Tips Section - Redesigned */}
                <section className="relative z-10 py-16 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tips Kesehatan Harian</h2>
                            <p className="text-slate-500">Panduan sederhana untuk hidup lebih berkualitas</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 opacity-50" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-red-100 rounded-xl text-red-600">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Pola Makan Sehat</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {[
                                            'Konsumsi sayur & buah 5 porsi/hari',
                                            'Batasi gula, garam, dan lemak jenuh',
                                            'Minum air putih minimal 8 gelas',
                                            'Hindari makanan olahan berlebih'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 text-sm font-medium">
                                                <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 text-xs shrink-0">✓</div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Aktivitas Fisik</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {[
                                            'Olahraga minimal 30 menit, 5x seminggu',
                                            'Kombinasi cardio & strength training',
                                            'Peregangan sebelum & sesudah olahraga',
                                            'Istirahat cukup 7-8 jam per hari'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 text-sm font-medium">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mr-3 text-xs shrink-0">✓</div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-xs text-slate-400 bg-slate-50 inline-block px-6 py-3 rounded-full border border-slate-100 max-w-2xl mx-auto leading-relaxed">
                                <span className="font-semibold text-slate-600">Disclaimer Medis:</span> Semua hasil kalkulator ini hanya untuk tujuan informasi dan edukasi.
                                Hasil tidak menggantikan diagnosis atau saran medis profesional dari dokter.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
