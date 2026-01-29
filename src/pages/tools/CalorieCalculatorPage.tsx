import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, RefreshCcw, Info, Flame, Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateCalories } from '@/utils/healthCalculations';
import Layout from '@/components/layout/Layout';
import { cn } from "@/lib/utils";

export default function CalorieCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [result, setResult] = useState<any>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseInt(age);

        if (w > 0 && h > 0 && a > 0) {
            const calorieResult = calculateCalories(w, h, a, gender, activityLevel);
            setResult(calorieResult);
        }
    };

    const handleReset = () => {
        setWeight('');
        setHeight('');
        setAge('');
        setGender('male');
        setActivityLevel('sedentary');
        setResult(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
                {/* Gradient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-100/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/tools-kesehatan" className="inline-flex items-center text-slate-500 hover:text-amber-600 transition-colors mb-4 font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Menu Tools
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalkulator Kalori</h1>
                        <p className="text-slate-500 mt-2 text-lg">Hitung kebutuhan energi harian Anda berdasarkan aktivitas fisik.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Interaction Card */}
                        <Card className="lg:col-span-5 h-fit border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
                            <CardHeader className="pb-4 pt-8 px-8">
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 shadow-sm rotate-3">
                                    <Calculator className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Parameter Tubuh</CardTitle>
                                <CardDescription>Informasi dasar untuk menghitung BMR & TDEE</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleCalculate} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="weight" className="text-slate-600 font-semibold text-sm">Berat (kg)</Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="0"
                                                className="h-12 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="height" className="text-slate-600 font-semibold text-sm">Tinggi (cm)</Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                placeholder="0"
                                                className="h-12 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="text-slate-600 font-semibold text-sm">Usia (thn)</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                placeholder="0"
                                                className="h-12 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-slate-600 font-semibold text-sm">Gender</Label>
                                            <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Laki-laki</SelectItem>
                                                    <SelectItem value="female">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity" className="text-slate-600 font-semibold text-sm">Tingkat Aktivitas</Label>
                                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedentary">Sedentary (Jarang Olahraga)</SelectItem>
                                                <SelectItem value="light">Light (Olahraga 1-3x / minggu)</SelectItem>
                                                <SelectItem value="moderate">Moderate (Olahraga 3-5x / minggu)</SelectItem>
                                                <SelectItem value="active">Active (Olahraga 6-7x / minggu)</SelectItem>
                                                <SelectItem value="veryActive">Very Active (Setiap Hari / Fisik Berat)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]">
                                            Hitung Kebutuhan
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
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Card className="border-0 shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Info className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metabolisme Dasar (BMR)</span>
                                            </div>
                                            <div className="text-4xl font-black text-slate-900 mb-1">{result.bmr}</div>
                                            <div className="text-xs text-slate-500 font-medium">Kalori Saat Istirahat Total</div>
                                        </Card>

                                        <Card className="border-0 shadow-lg shadow-slate-200/40 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-6 text-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-white/20 text-white rounded-lg">
                                                    <Flame className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Kebutuhan Harian (TDEE)</span>
                                            </div>
                                            <div className="text-4xl font-black mb-1">{result.tdee}</div>
                                            <div className="text-xs text-white/80 font-medium">Kalori Untuk Mempertahankan Berat</div>
                                        </Card>
                                    </div>

                                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[2.5rem] overflow-hidden">
                                        <div className="bg-slate-50 p-6 px-8 border-b border-slate-100 flex items-center gap-3">
                                            <Target className="w-5 h-5 text-amber-600" />
                                            <h3 className="font-bold text-slate-800">Rencana Berdasarkan Tujuan</h3>
                                        </div>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-50">
                                                {[
                                                    { label: 'Turun Berat Badan', speed: '-0.5 kg / minggu', value: result.weightLoss, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
                                                    { label: 'Turun Berat Ringan', speed: '-0.25 kg / minggu', value: result.mildLoss, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50' },
                                                    { label: 'Maintain (Tetap)', speed: 'Stabil', value: result.maintain, icon: Minus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                    { label: 'Naik Berat Ringan', speed: '+0.25 kg / minggu', value: result.mildGain, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                                                    { label: 'Naik Berat Badan', speed: '+0.5 kg / minggu', value: result.weightGain, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                                ].map((item, i) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <div key={i} className="flex items-center justify-between p-5 md:p-6 px-8 hover:bg-slate-50/50 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900">{item.label}</div>
                                                                    <div className="text-xs text-slate-400 font-medium">{item.speed}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={cn("text-xl font-black tabular-nums", item.color)}>{item.value}</div>
                                                                <div className="text-[10px] uppercase font-bold text-slate-300 tracking-tighter">kkal / hari</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <Calculator className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">Siap untuk Berhitung?</h3>
                                    <p className="text-slate-400 max-w-xs text-sm">Lengkapi data profil tubuh Anda di sisi kiri untuk melihat kebutuhan kalori harian.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
                        <p>Hasil perhitungan ini didasarkan pada rumus Mifflin-St Jeor. <br /> Untuk hasil yang lebih personal dan program kesehatan yang aman, silakan berkonsultasi dengan Spesialis Gizi kami di RSUD Dr. M. Soewandhie.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
