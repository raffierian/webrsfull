import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, RefreshCcw, Info, GlassWater, Milestone, CheckCircle2, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateWaterIntake } from '@/utils/healthCalculations';
import Layout from '@/components/layout/Layout';
import { cn } from "@/lib/utils";

export default function WaterIntakeCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(weight);

        if (w > 0) {
            const waterResult = calculateWaterIntake(w, activityLevel);
            setResult(waterResult);
        }
    };

    const handleReset = () => {
        setWeight('');
        setActivityLevel('sedentary');
        setResult(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-cyan-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kebutuhan Air Harian</h1>
                        <p className="text-slate-500 mt-2 text-lg">Hitung seberapa banyak air yang dibutuhkan tubuh Anda setiap harinya.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center mb-4 text-cyan-600 shadow-sm rotate-3">
                                    <Droplets className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Data Hidrasi</CardTitle>
                                <CardDescription>Masukkan berat badan dan aktivitas</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleCalculate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight" className="text-slate-600 font-semibold">Berat Badan (kg)</Label>
                                        <div className="relative">
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.1"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="Contoh: 70"
                                                className="pl-4 pr-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-4 text-slate-400 font-medium">kg</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity" className="text-slate-600 font-semibold">Tingkat Aktivitas</Label>
                                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                                            <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-base px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedentary">Sedentary (Jarang Bergerak)</SelectItem>
                                                <SelectItem value="light">Light (Jalan Santai)</SelectItem>
                                                <SelectItem value="moderate">Moderate (Olahraga 3x/minggu)</SelectItem>
                                                <SelectItem value="active">Active (Olahraga Setiap Hari)</SelectItem>
                                                <SelectItem value="veryActive">Very Active (Atlet / Kerja Fisik)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02]">
                                            Hitung Hidrasi
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                            <RefreshCcw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        Tubuh yang terhidrasi dengan baik dapat meningkatkan fokus dan energi sepanjang hari.
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
                                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-center text-white relative overflow-hidden">
                                                <Waves className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                                                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Total Target Hidrasi</div>
                                                <div className="text-7xl font-black tabular-nums tracking-tighter mb-2">
                                                    {result.withActivity}
                                                </div>
                                                <div className="text-sm font-medium">Liter Per Hari</div>
                                            </div>

                                            <div className="p-8">
                                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-cyan-200 transition-all">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                                            <GlassWater className="w-6 h-6 text-cyan-500" />
                                                        </div>
                                                        <div className="text-2xl font-black text-slate-900">{Math.round(result.withActivity * 4)}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gelas (250ml)</div>
                                                    </div>
                                                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-blue-200 transition-all">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                                            <Milestone className="w-6 h-6 text-blue-500" />
                                                        </div>
                                                        <div className="text-2xl font-black text-slate-900">{Math.round(result.withActivity * 1.67)}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Botol (600ml)</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-slate-800 px-1">Rekomendasi Kami:</h3>
                                                    <div className="p-5 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-900 font-medium text-sm leading-relaxed">
                                                        {result.recommendation}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            'Minum saat bangun tidur',
                                                            'Bawa botol minum',
                                                            'Minum sebelum makan',
                                                            'Pantau warna urin'
                                                        ].map((item, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                {item.toUpperCase()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-amber-500">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                                            Kebutuhan air dapat meningkat jika Anda sedang berada di cuaca panas, mengalami demam, atau sedang menyusui.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <Droplets className="w-8 h-8 text-cyan-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Cek Level Hidrasi</h3>
                                    <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Masukkan berat badan Anda untuk melihat target minum air harian agar tetap bugar.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
                        <p>RSUD Dr. M. Soewandhie - Peduli Kesehatan Anda. <br /> Pastikan asupan cairan cukup untuk mendukung fungsi organ tubuh secara maksimal.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
