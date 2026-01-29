import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Baby, RefreshCcw, Calendar, Target, Heart, Info, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculatePregnancy } from '@/utils/healthCalculations';
import Layout from '@/components/layout/Layout';
import { cn } from "@/lib/utils";

export default function PregnancyCalculatorPage() {
    const [lmpDate, setLmpDate] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        if (lmpDate) {
            const pregnancyResult = calculatePregnancy(new Date(lmpDate));
            setResult(pregnancyResult);
        }
    };

    const handleReset = () => {
        setLmpDate('');
        setResult(null);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-pink-100 selection:text-pink-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-pink-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalkulator Kehamilan</h1>
                        <p className="text-slate-500 mt-2 text-lg">Pantau usia kandungan dan perkiraan hari lahir si buah hati.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 text-pink-600 shadow-sm rotate-3">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Input Data HPHT</CardTitle>
                                <CardDescription>Hari Pertama Haid Terakhir</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleCalculate} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="lmpDate" className="text-slate-600 font-semibold">Pilih Tanggal HPHT</Label>
                                        <Input
                                            id="lmpDate"
                                            type="date"
                                            value={lmpDate}
                                            onChange={(e) => setLmpDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="h-14 text-base bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-2xl transition-all"
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium px-1">
                                            Informasi ini sangat penting untuk menentukan usia gestasi bayi secara akurat.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" className="flex-1 h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 transition-all hover:scale-[1.02]">
                                            Hitung Estimasi
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                            <RefreshCcw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 p-6 bg-pink-50 rounded-[2rem] border border-pink-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Heart className="w-5 h-5 text-pink-500" />
                                        <h4 className="font-bold text-pink-900 text-sm">Konsultasi Kehamilan</h4>
                                    </div>
                                    <p className="text-xs text-pink-800 leading-relaxed">
                                        Kami merekomendasikan pemeriksaan USG di RSUD Dr. M. Soewandhie untuk memastikan kesehatan janin dan menentukan usia kehamilan yang lebih pasti.
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
                                            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-center text-white">
                                                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Hari Perkiraan Lahir (HPL)</div>
                                                <div className="text-3xl md:text-4xl font-black mb-3 text-pretty">
                                                    {formatDate(result.dueDate)}
                                                </div>
                                                <div className="bg-white/20 px-4 py-1.5 rounded-full inline-block text-sm font-bold backdrop-blur-sm">
                                                    <Clock className="w-4 h-4 inline mr-2 mb-0.5" />
                                                    {result.daysRemaining} Hari Lagi
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usia Kehamilan</div>
                                                        <div className="text-2xl font-black text-pink-600">{result.currentWeeks} <span className="text-sm font-bold text-slate-400">Minggu</span></div>
                                                        <div className="text-[10px] font-bold text-slate-500">{result.currentDays} Hari</div>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trimester Saat Ini</div>
                                                        <div className="text-2xl font-black text-pink-600">Trimester {result.trimester}</div>
                                                        <div className="text-[10px] font-bold text-slate-500">
                                                            {result.trimester === 1 && 'Perkembangan Awal'}
                                                            {result.trimester === 2 && 'Masa Keemasan'}
                                                            {result.trimester === 3 && 'Persiapan Lahir'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Target className="w-5 h-5 text-pink-500" />
                                                        <h3 className="font-bold text-slate-800">Milestone Kehamilan</h3>
                                                    </div>

                                                    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                                        <div className="relative">
                                                            <div className="absolute -left-8 top-1.5 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                                                            </div>
                                                            <div className="font-bold text-slate-900 text-sm">Perkiraan Konsepsi</div>
                                                            <div className="text-xs text-slate-500">{formatDate(result.conceptionDate)}</div>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute -left-8 top-1.5 w-6 h-6 bg-pink-100 border-2 border-pink-500 rounded-full flex items-center justify-center z-10">
                                                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                                                            </div>
                                                            <div className="font-bold text-pink-600 text-sm">Target Pemeriksaan USG</div>
                                                            <div className="text-xs text-slate-500">Setiap 4 Minggu Sekali</div>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute -left-8 top-1.5 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                                                            </div>
                                                            <div className="font-bold text-slate-900 text-sm">Hari Perkiraan Lahir</div>
                                                            <div className="text-xs text-slate-500">{formatDate(result.dueDate)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            Saran Ibu Hamil
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                'Penuhi asupan nutrisi & air',
                                                'Kurangi stres berlebih',
                                                'Lakukan senam hamil ringan',
                                                'Pastikan istirahat cukup 8 jam'
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <Baby className="w-8 h-8 text-pink-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Pantau Buah Hati</h3>
                                    <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Pilih tanggal hari pertama haid terakhir (HPHT) Anda untuk memulai perhitungan.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
                        <p>RSUD Dr. M. Soewandhie - Sahabat Setia Keluarga Anda. <br /> Monitoring rutin kehamilan sangat penting untuk kesehatan Ibu dan Bayi.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
