import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, RefreshCcw, Heart, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateHeartRate } from '@/utils/healthCalculations';
import Layout from '@/components/layout/Layout';
import { cn } from "@/lib/utils";

export default function HeartRateCalculatorPage() {
    const [age, setAge] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const a = parseInt(age);

        if (a > 0 && a < 120) {
            const hrResult = calculateHeartRate(a);
            setResult(hrResult);
        }
    };

    const handleReset = () => {
        setAge('');
        setResult(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-rose-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalkulator Denyut Jantung</h1>
                        <p className="text-slate-500 mt-2 text-lg">Hitung zona latihan aman dan denyut jantung maksimal berdasarkan usia.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 text-rose-600 shadow-sm rotate-3">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Informasi Usia</CardTitle>
                                <CardDescription>Cukup masukkan usia Anda saat ini</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleCalculate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-slate-600 font-semibold">Usia (Tahun)</Label>
                                        <div className="relative">
                                            <Input
                                                id="age"
                                                type="number"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                placeholder="Contoh: 30"
                                                className="pl-4 pr-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 rounded-2xl transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-4 text-slate-400 font-medium">thn</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.02]">
                                            Hitung Target
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                            <RefreshCcw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                        Gunakan hasil ini sebagai panduan intensitas olahraga. Jika Anda memiliki riwayat jantung, silakan berkonsultasi dengan Spesialis Jantung kami.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Result Card */}
                        <div className="lg:col-span-7">
                            {result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[2.5rem] overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="bg-gradient-to-br from-rose-500 to-red-600 p-8 text-center text-white">
                                                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Max Heart Rate</div>
                                                <div className="text-7xl font-black tabular-nums tracking-tighter mb-2">
                                                    {result.maxHeartRate}
                                                </div>
                                                <div className="text-sm font-medium">bpm (Beats Per Minute)</div>
                                            </div>

                                            <div className="p-8">
                                                <div className="mb-6 flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Activity className="w-5 h-5 text-rose-500" />
                                                        Zona Latihan Ideal
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target BPM</span>
                                                </div>

                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Istirahat (Normal)', zone: '60-100 bpm', range: `${result.restingHeartRate.min} - ${result.restingHeartRate.max}`, color: 'text-slate-400', bg: 'bg-slate-50' },
                                                        { label: 'Moderate (Bakar Lemak)', zone: '50-70% Max', range: `${result.moderateZone.min} - ${result.moderateZone.max}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                        { label: 'Vigorous (Kardio)', zone: '70-85% Max', range: `${result.vigorousZone.min} - ${result.vigorousZone.max}`, color: 'text-orange-600', bg: 'bg-orange-50' },
                                                        { label: 'Peak (Intensif)', zone: '85-95% Max', range: `${result.peakZone.min} - ${result.peakZone.max}`, color: 'text-rose-600', bg: 'bg-rose-50' },
                                                    ].map((zone, i) => (
                                                        <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("w-1.5 h-8 rounded-full", zone.bg.replace('bg-', 'bg-').replace('50', '500'))} />
                                                                <div>
                                                                    <div className="font-bold text-slate-800 text-sm md:text-base">{zone.label}</div>
                                                                    <div className="text-[10px] md:text-xs font-medium text-slate-400">{zone.zone}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={cn("text-lg md:text-xl font-black tabular-nums", zone.color)}>{zone.range}</div>
                                                                <div className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase letter tracking-tighter">Beats Per Minute</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm mb-1">Jalan Cepat</div>
                                                <div className="text-xs text-slate-500">Cocok untuk zona Moderat</div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm mb-1">Berlari / HIIT</div>
                                                <div className="text-xs text-slate-500">Target zona Peak</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm animate-pulse">
                                        <Heart className="w-8 h-8 text-rose-200 fill-rose-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Cek Detak Jantung Anda</h3>
                                    <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Masukkan usia Anda untuk menghitung batas aman detak jantung saat berolahraga.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
                        <p>RSUD Dr. M. Soewandhie mendukung gaya hidup sehat Anda. <br /> Gunakan alat ini sebagai referensi, namun dengarkan tubuh Anda saat beraktivitas fisik.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
