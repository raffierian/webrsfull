import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, RefreshCcw, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { calculateBMI } from '@/utils/healthCalculations';
import { cn } from "@/lib/utils";

export default function BMICalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (w > 0 && h > 0) {
            const bmiResult = calculateBMI(w, h);
            setResult(bmiResult);
        }
    };

    const handleReset = () => {
        setWeight('');
        setHeight('');
        setResult(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalkulator BMI</h1>
                        <p className="text-slate-500 mt-2 text-lg">Hitung Indeks Massa Tubuh untuk mengetahui status berat badan ideal Anda.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm rotate-3">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Masukkan Data</CardTitle>
                                <CardDescription>Lengkapi formulir di bawah ini dengan akurat</CardDescription>
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
                                                placeholder="0"
                                                className="pl-4 pr-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-4 text-slate-400 font-medium">kg</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="height" className="text-slate-600 font-semibold">Tinggi Badan (cm)</Label>
                                        <div className="relative">
                                            <Input
                                                id="height"
                                                type="number"
                                                step="0.1"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                placeholder="0"
                                                className="pl-4 pr-12 h-14 text-lg bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl transition-all"
                                                required
                                            />
                                            <span className="absolute right-4 top-4 text-slate-400 font-medium">cm</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]">
                                            Hitung BMI
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                            <RefreshCcw className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Result Card */}
                        <div className="lg:col-span-7">
                            {result ? (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                                        <div className={cn("h-2 w-full",
                                            result.bmi < 18.5 ? "bg-blue-500" :
                                                result.bmi < 25 ? "bg-emerald-500" :
                                                    result.bmi < 30 ? "bg-amber-500" : "bg-red-500"
                                        )} />
                                        <CardContent className="p-8 md:p-10 text-center">
                                            <h3 className="text-slate-500 font-medium uppercase tracking-wide mb-6">Hasil Analisa</h3>

                                            <div className="relative inline-flex items-center justify-center mb-8">
                                                {/* Speedometer Semicircle Background */}
                                                <svg className="w-64 h-32 overflow-hidden" viewBox="0 0 200 100">
                                                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
                                                    {/* Simplified Indicator Path - Dynamic based on BMI */}
                                                    <path
                                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="20"
                                                        strokeLinecap="round"
                                                        className={cn("transition-all duration-1000 ease-out",
                                                            result.bmi < 18.5 ? "text-blue-500" :
                                                                result.bmi < 25 ? "text-emerald-500" :
                                                                    result.bmi < 30 ? "text-amber-500" : "text-red-500"
                                                        )}
                                                        strokeDasharray="251.2"
                                                        strokeDashoffset={251.2 - (Math.min(result.bmi, 40) / 40) * 251.2}
                                                    />
                                                </svg>
                                                <div className="absolute bottom-0 text-center">
                                                    <div className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">
                                                        {result.bmi}
                                                    </div>
                                                    <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                        result.bmi < 18.5 ? "bg-blue-100 text-blue-700" :
                                                            result.bmi < 25 ? "bg-emerald-100 text-emerald-700" :
                                                                result.bmi < 30 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {result.category}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-slate-600 leading-relaxed max-w-lg mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                {result.description}
                                            </p>

                                        </CardContent>
                                        <div className="bg-slate-50/80 p-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-slate-500">
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                                <div className="font-bold text-blue-600 mb-1">&lt; 18.5</div>
                                                <div>Kurus</div>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 ring-1 ring-emerald-500/20">
                                                <div className="font-bold text-emerald-600 mb-1">18.5 - 24.9</div>
                                                <div>Normal</div>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                                <div className="font-bold text-amber-600 mb-1">25 - 29.9</div>
                                                <div>Gemuk</div>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                                <div className="font-bold text-red-600 mb-1">≥ 30</div>
                                                <div>Obesitas</div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <Info className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Belum ada hasil</h3>
                                    <p className="text-slate-400 max-w-xs">Masukkan berat dan tinggi badan Anda di panel sebelah kiri untuk melihat analisa.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto">
                        <p>Rumus BMI tidak selalu akurat untuk atlet berotot, ibu hamil, atau lansia. <br /> Gunakan hasil ini sebagai referensi awal saja.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
