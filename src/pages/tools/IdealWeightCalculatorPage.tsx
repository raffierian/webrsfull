import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, RefreshCcw, Info, User, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateIdealWeight } from '@/utils/healthCalculations';
import Layout from '@/components/layout/Layout';
import { cn } from "@/lib/utils";

export default function IdealWeightCalculatorPage() {
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const h = parseFloat(height);

        if (h > 0) {
            const weightResult = calculateIdealWeight(h, gender);
            setResult(weightResult);
        }
    };

    const handleReset = () => {
        setHeight('');
        setGender('male');
        setResult(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-purple-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Berat Badan Ideal</h1>
                        <p className="text-slate-500 mt-2 text-lg">Cari tahu berat badan paling sehat untuk postur tubuh Anda.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600 shadow-sm rotate-3">
                                    <User className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Profil Tubuh</CardTitle>
                                <CardDescription>Masukkan tinggi badan dan jenis kelamin</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleCalculate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="height" className="text-slate-600 font-semibold">Tinggi Badan (cm)</Label>
                                        <div className="relative">
                                            <Input
                                                id="height"
                                                type="number"
                                                step="0.1"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                placeholder="Contoh: 170"
                                                className="pl-4 pr-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-2xl transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-4 text-slate-400 font-medium">cm</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-slate-600 font-semibold">Jenis Kelamin</Label>
                                        <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                                            <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-base px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Laki-laki</SelectItem>
                                                <SelectItem value="female">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]">
                                            Cari Berat Ideal
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                            <RefreshCcw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        Berat badan ideal adalah estimasi. Hasil terbaik dapat ditinjau melalui konsultasi dengan dokter spesialis kami.
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
                                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-center text-white">
                                                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Ideal Weight (Avg)</div>
                                                <div className="text-7xl font-black tabular-nums tracking-tighter mb-2">
                                                    {result.average}
                                                </div>
                                                <div className="text-sm font-medium">Kilogram (kg)</div>
                                            </div>

                                            <div className="p-8">
                                                <div className="mb-6 flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Scale className="w-5 h-5 text-purple-500" />
                                                        Perbandingan Formula Medis
                                                    </h3>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {[
                                                        { label: 'Broca', value: result.broca, desc: 'Metode Klasik' },
                                                        { label: 'Devine', value: result.devine, desc: 'Standar Medis' },
                                                        { label: 'Robinson', value: result.robinson, desc: 'Akurat Pria' },
                                                        { label: 'Miller', value: result.miller, desc: 'Akurat Wanita' },
                                                    ].map((formula, i) => (
                                                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-white transition-all duration-300">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formula.label}</span>
                                                                <CheckCircle2 className="w-4 h-4 text-purple-200" />
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                                                                {formula.value} <span className="text-sm font-bold text-slate-400">kg</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-medium mt-1">{formula.desc}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                            <Info className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                            Ingat, berat badan bukan satu-satunya indikator kesehatan. Komposisi otot dan lemak tubuh (body fat %) juga sangat penting.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <Scale className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Berapa Berat Ideal Anda?</h3>
                                    <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Masukkan tinggi badan Anda untuk melihat perbandingan berbagai formula berat badan ideal medis.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
                        <p>RSUD Dr. M. Soewandhie - Melayani Dengan Hati. <br /> Gunakan hasil ini sebagai referensi hidup sehat Anda setiap hari.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
