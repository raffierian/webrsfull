import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Bed, ArrowLeft, Activity, Info, Phone, Clock, Stethoscope, Star, BedDouble, Users, AlertCircle, Baby, Search, X } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface RoomSummary {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    reserved: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: string;
}

interface SummaryData {
    [key: string]: RoomSummary;
}

interface RoomDetail {
    id: string;
    roomNumber: string;
    roomName: string | null;
    roomType: string;
    status: string;
    capacity: number;
    occupiedBeds: number;
    floor: number;
    building: string;
}

// Room type configuration
const roomTypeLabels: Record<string, string> = {
    PAVILIUN_EXECUTIVE: 'Paviliun Executive',
    PAVILIUN_DELUXE: 'Paviliun Deluxe',
    KELAS_1: 'Kelas I',
    KELAS_2: 'Kelas II',
    KELAS_3: 'Kelas III',
    ISOLASI: 'Isolasi',
    INTENSIF: 'Intensif',
    INTENSIF_LAINNYA: 'Intensif Lainnya',
    PERINATOLOGI: 'Perinatologi',
};

const roomStyles: Record<string, { color: string; bg: string; icon: any; gradient: string }> = {
    PAVILIUN_EXECUTIVE: { color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500/10 to-purple-500/5', icon: Star },
    PAVILIUN_DELUXE: { color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5', icon: Star },
    KELAS_1: { color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5', icon: BedDouble },
    KELAS_2: { color: 'text-sky-600', bg: 'bg-sky-50', gradient: 'from-sky-500/10 to-sky-500/5', icon: Users },
    KELAS_3: { color: 'text-cyan-600', bg: 'bg-cyan-50', gradient: 'from-cyan-500/10 to-cyan-500/5', icon: Users },
    ISOLASI: { color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5', icon: AlertCircle },
    INTENSIF: { color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-rose-500/5', icon: Activity },
    INTENSIF_LAINNYA: { color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500/10 to-orange-500/5', icon: Activity },
    PERINATOLOGI: { color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5', icon: Baby },
};

// Category Grouping Logic
const getCategory = (type: string) => {
    if (type.includes('PAVILIUN')) return 'VIP';
    if (['INTENSIF', 'INTENSIF_LAINNYA', 'ISOLASI', 'PERINATOLOGI'].includes(type) || type.includes('ICU') || type.includes('NICU')) return 'INTENSIVE';
    return 'REGULAR';
};

export default function InpatientInfoPage() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, VIP, REGULAR, INTENSIVE

    // Detail Modal State
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        loadSummary();
        const interval = setInterval(loadSummary, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch details when a type is selected
    useEffect(() => {
        if (selectedType) {
            loadRoomDetails(selectedType);
        }
    }, [selectedType]);

    const loadSummary = async () => {
        try {
            const data = await api.inpatientRooms.getSummary();
            setSummary(data);
        } catch (error) {
            console.error('Failed to load room summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRoomDetails = async (type: string) => {
        setLoadingDetails(true);
        try {
            const response = await api.inpatientRooms.getAll(`type=${type}&limit=100`);
            setRoomDetails(response.rooms);
        } catch (error) {
            console.error('Failed to load room details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Derived state for filtered rooms
    const filteredRooms = summary ? Object.entries(summary).filter(([type]) => {
        const matchesSearch = roomTypeLabels[type].toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || getCategory(type) === activeFilter;
        return matchesSearch && matchesFilter;
    }) : [];

    return (
        <Layout>
            <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
                {/* Background Gradients */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Hero Section */}
                <section className="relative z-10 pt-20 pb-16 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-block animate-in fade-in zoom-in duration-700">
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 inline-block border border-blue-100">
                                RSUD Dr. M. Soewandhie
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight animate-in slide-in-from-bottom-4 duration-700 delay-100">
                            Ketersediaan <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kamar Rawat Inap</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                            Pantau ketersediaan tempat tidur secara real-time. Transparan, akurat, dan terupdate setiap 30 detik untuk kenyamanan Anda.
                        </p>

                        {/* Search & Filter Bar */}
                        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl border border-white/50 shadow-xl shadow-blue-900/5 max-w-2xl mx-auto flex flex-col md:flex-row gap-2 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Cari ruangan..."
                                    className="pl-12 h-12 bg-transparent border-transparent hover:bg-slate-50/50 focus:bg-white transition-colors rounded-2xl text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex p-1 bg-slate-100/50 rounded-2xl">
                                {[
                                    { id: 'ALL', label: 'Semua' },
                                    { id: 'VIP', label: 'VIP' },
                                    { id: 'REGULAR', label: 'Reguler' },
                                    { id: 'INTENSIVE', label: 'Intensif' }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                                            activeFilter === filter.id
                                                ? "bg-white text-blue-700 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                        )}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Stats Grid */}
                <section className="container mx-auto px-4 max-w-7xl pb-24 relative z-10">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-[2rem] bg-slate-200/50" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map(([type, data], index) => {
                                    const style = roomStyles[type] || { color: 'text-slate-600', bg: 'bg-slate-50', gradient: '', icon: Info };
                                    return (
                                        <div
                                            key={type}
                                            className="group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards cursor-pointer"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            onClick={() => setSelectedType(type)}
                                        >
                                            <Card className="h-full border-0 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-md ring-1 ring-white/50 hover:scale-[1.02]">
                                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", style.gradient)} />

                                                <CardHeader className="pb-2 pt-6 px-6 relative">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 shadow-sm", style.bg)}>
                                                            <style.icon className={cn("w-6 h-6", style.color)} />
                                                        </div>
                                                        <Badge variant="outline" className="bg-white/50 backdrop-blur border-slate-200 text-slate-500 font-medium px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                                            {getCategory(type)}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                        {roomTypeLabels[type]}
                                                    </h3>
                                                </CardHeader>

                                                <CardContent className="px-6 pb-6 relative">
                                                    <div className="mt-4 flex items-baseline gap-2">
                                                        <span className="text-6xl font-bold tracking-tighter text-slate-900">
                                                            {data.availableBeds}
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
                                                            Tersedia
                                                        </span>
                                                    </div>

                                                    <div className="mt-8 space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                                                <span>Kapasitas {data.totalBeds} Bed</span>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    data.availableBeds === 0 ? "text-red-500" : "text-emerald-600"
                                                                )}>
                                                                    {data.availableBeds === 0 ? 'Penuh' : `${data.occupiedBeds} Terisi`}
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out relative",
                                                                        data.availableBeds > 5 ? "bg-emerald-500" : data.availableBeds > 0 ? "bg-amber-400" : "bg-red-500"
                                                                    )}
                                                                    style={{ width: `${(data.availableBeds / data.totalBeds) * 100}%` }}
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                        <Search className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Tidak ada ruangan ditemukan</h3>
                                    <p className="text-slate-500 mt-2">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
                                    <Button
                                        variant="link"
                                        onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }}
                                        className="mt-4 text-blue-600"
                                    >
                                        Reset Pencarian
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Dialog/Tabs Section */}
                    <div className="mt-32 max-w-5xl mx-auto">
                        <Tabs defaultValue="facilities" className="w-full">
                            <div className="flex justify-center mb-8 md:mb-16 overflow-x-auto no-scrollbar pb-4 md:pb-0 px-4">
                                <TabsList className="bg-white/80 p-1.5 md:p-2 rounded-2xl md:rounded-full backdrop-blur-md shadow-lg shadow-slate-200/50 border border-white/50 h-auto flex flex-nowrap whitespace-nowrap">
                                    <TabsTrigger value="facilities" className="rounded-xl md:rounded-full px-4 md:px-8 py-2 md:py-3 text-sm font-medium transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
                                        Fasilitas & Layanan
                                    </TabsTrigger>
                                    <TabsTrigger value="pricing" className="rounded-xl md:rounded-full px-4 md:px-8 py-2 md:py-3 text-sm font-medium transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
                                        Informasi Tarif
                                    </TabsTrigger>
                                    <TabsTrigger value="procedure" className="rounded-xl md:rounded-full px-4 md:px-8 py-2 md:py-3 text-sm font-medium transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
                                        Alur Pendaftaran
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="px-4">
                                <TabsContent value="facilities" className="animate-in fade-in-50 slide-in-from-bottom-8 duration-500 outline-none">
                                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-xl shadow-purple-900/5 hover:translate-y-[-4px] transition-transform duration-300">
                                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-8 rotate-3">
                                                <Star className="w-7 h-7 text-purple-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-6">VIP & Private</h3>
                                            <ul className="space-y-4">
                                                {['AC Private & Smart TV', 'Kamar Mandi Dalam (Water Heater)', 'Sofa Bed Penunggu', 'Kulkas Mini & Dispenser', 'Menu Makanan Premium'].map((item, i) => (
                                                    <li key={i} className="flex items-center text-slate-600">
                                                        <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4 shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-current" />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-xl shadow-blue-900/5 hover:translate-y-[-4px] transition-transform duration-300">
                                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 -rotate-3">
                                                <Users className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Reguler (Kelas 1-3)</h3>
                                            <ul className="space-y-4">
                                                {['AC Central/Split', 'Kamar Mandi Bersih', 'Nurse Call System 24 Jam', 'Lemari Penyimpanan Pasien', 'Makan 3x Sehari (Ahli Gizi)'].map((item, i) => (
                                                    <li key={i} className="flex items-center text-slate-600">
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-current" />
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="pricing" className="animate-in fade-in-50 slide-in-from-bottom-8 duration-500 outline-none">
                                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/50 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Ruangan</th>
                                                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fasilitas Utama</th>
                                                        <th className="px-8 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Tarif Per Hari</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {[
                                                        { type: 'Paviliun (VIP)', facility: '1 Bed, Sofa, TV, Kulkas', price: 'Rp 750.000 - 1.200.000' },
                                                        { type: 'Kelas I', facility: '2 Bed, TV LCD, AC', price: 'Rp 400.000 - 600.000' },
                                                        { type: 'Kelas II', facility: '3-4 Bed, AC', price: 'Rp 250.000 - 350.000' },
                                                        { type: 'Kelas III', facility: '6 Bed, AC/Kipas', price: 'Rp 150.000 - 200.000' },
                                                        { type: 'ICU / NICU', facility: 'Perawatan Intensif', price: 'Sesuai Tindakan' },
                                                    ].map((row, i) => (
                                                        <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                                                            <td className="px-8 py-6 font-bold text-slate-900">{row.type}</td>
                                                            <td className="px-8 py-6 text-slate-600 text-sm">{row.facility}</td>
                                                            <td className="px-8 py-6 text-right font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{row.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="bg-slate-50/80 px-8 py-6 flex gap-4 items-center border-t border-slate-100">
                                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                                <Info className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">Tarif di atas adalah estimasi jasa sarana kamar (akomodasi). Belum termasuk jasa dokter, obat-obatan, dan tindakan medis lainnya.</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="procedure" className="animate-in fade-in-50 slide-in-from-bottom-8 duration-500 outline-none">
                                    <div className="bg-white/80 backdrop-blur-xl p-8 md:p-16 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/50">
                                        <div className="grid md:grid-cols-4 gap-8">
                                            {[
                                                { title: 'Registrasi', desc: 'Loket Admisi', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
                                                { title: 'Pilih Kamar', desc: 'Sesuai Kelas', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
                                                { title: 'Verifikasi', desc: 'Data & BPJS', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                                                { title: 'Masuk', desc: 'Ruang Rawat', icon: Bed, color: 'text-rose-600', bg: 'bg-rose-100' },
                                            ].map((step, i) => (
                                                <div key={i} className="relative group text-center md:text-left">
                                                    {i !== 3 && (
                                                        <div className="hidden md:block absolute top-8 left-16 right-0 h-0.5 bg-slate-100">
                                                            <div className="h-full bg-slate-200 w-0 group-hover:w-full transition-all duration-700" />
                                                        </div>
                                                    )}
                                                    <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm transition-transform duration-300 group-hover:scale-110", step.bg)}>
                                                        <step.icon className={cn("w-8 h-8", step.color)} />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                                                    <p className="text-slate-500 text-sm">{step.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </section>

                {/* Footer / CTA with refined gradient */}
                <section className="bg-white border-t border-slate-200 py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-900/20 rotate-12">
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Butuh Bantuan Pendaftaran?</h2>
                        <p className="text-slate-500 mb-10 max-w-lg mx-auto text-lg">Tim Admisi kami siap membantu Anda 24 jam sehari untuk informasi ketersediaan kamar.</p>

                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Button size="lg" className="rounded-2xl px-8 h-14 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 text-base font-semibold group">
                                Hubungi Call Center
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-base font-semibold">
                                Chat WhatsApp
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Detail Dialog */}
                <Dialog open={!!selectedType} onOpenChange={(open) => !open && setSelectedType(null)}>
                    <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] border-white/20 p-8 shadow-2xl">
                        <DialogHeader className="mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {selectedType && (() => {
                                        const style = roomStyles[selectedType];
                                        const Icon = style?.icon;
                                        return (
                                            <div className={cn("p-3 rounded-2xl", style?.bg)}>
                                                {Icon && <Icon className={cn("w-6 h-6", style.color)} />}
                                            </div>
                                        );
                                    })()}
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-slate-900">
                                            {selectedType && roomTypeLabels[selectedType]}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-500">
                                            Rincian ketersediaan per ruangan
                                        </DialogDescription>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        {loadingDetails ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl bg-slate-100" />)}
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                                {roomDetails.length > 0 ? (
                                    roomDetails.map((room) => {
                                        const availableBeds = room.capacity - room.occupiedBeds;
                                        const isFull = availableBeds === 0;

                                        return (
                                            <div
                                                key={room.id}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5"
                                            >
                                                <div className="mb-4 sm:mb-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                            {room.roomName}
                                                            <span className="text-slate-500 font-medium text-base">
                                                                No. {room.roomNumber}
                                                            </span>
                                                        </h4>
                                                        <Badge variant="secondary" className={cn(
                                                            "bg-white border text-xs font-semibold px-2 py-0.5",
                                                            isFull ? "border-red-200 text-red-600" : "border-emerald-200 text-emerald-600"
                                                        )}>
                                                            {isFull ? 'PENUH' : 'TERSEDIA'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-slate-500 flex gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {room.building || '-'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Activity className="w-3 h-3" />
                                                            Lantai {room.floor}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-slate-900 tabular-nums">
                                                            {availableBeds}
                                                            <span className="text-sm text-slate-400 font-medium ml-1">/ {room.capacity}</span>
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bed Kosong</div>
                                                    </div>

                                                    <div className="w-16 h-16 relative flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle
                                                                cx="32"
                                                                cy="32"
                                                                r="28"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                                fill="none"
                                                                className="text-slate-200"
                                                            />
                                                            <circle
                                                                cx="32"
                                                                cy="32"
                                                                r="28"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                                fill="none"
                                                                strokeDasharray={176}
                                                                strokeDashoffset={176 - (176 * availableBeds) / room.capacity}
                                                                className={cn(
                                                                    "transition-all duration-1000 ease-out",
                                                                    isFull ? "text-red-500" : "text-emerald-500"
                                                                )}
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <Bed className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Belum ada data ruangan untuk kategori ini.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
