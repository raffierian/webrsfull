import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageSquare, Clock, CheckCircle, User, Calendar, Activity, ChevronRight, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const DoctorConsultations = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch consultations
    const { data: consultations, isLoading } = useQuery({
        queryKey: ['doctor-consultations', statusFilter],
        queryFn: () => api.doctor.getConsultations(statusFilter === 'all' ? undefined : statusFilter)
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['doctor-stats'],
        queryFn: () => api.doctor.getStats()
    });

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: any; label: string; bgClass: string; icon: any }> = {
            PENDING: { variant: 'secondary', label: 'Menunggu', bgClass: 'bg-amber-100 text-amber-800 hover:bg-amber-100', icon: Clock },
            ACTIVE: { variant: 'default', label: 'Aktif', bgClass: 'bg-teal-100 text-teal-800 hover:bg-teal-100', icon: MessageSquare },
            CLOSED: { variant: 'outline', label: 'Selesai', bgClass: 'bg-slate-100 text-slate-700 hover:bg-slate-100', icon: CheckCircle }
        };
        const { label, bgClass, icon: Icon } = config[status] || config.PENDING;
        return (
            <Badge className={`gap-1 outline-none border-none shadow-none px-3 py-1 font-medium ${bgClass}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Memuat data konsultasi Anda...</p>
                </div>
            </div>
        );
    }

    const filteredConsultations = Array.isArray(consultations) ? consultations : [];
    const userName = JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Dokter';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Premium Hero Header */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 text-white pb-24 pt-8 md:pt-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-teal-50 text-xs font-medium backdrop-blur-sm border border-white/10 mb-2">
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Portal Telemedicine</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Selamat Datang, {userName}</h1>
                            <p className="text-teal-100 max-w-xl text-sm md:text-base leading-relaxed">
                                Pantau dan kelola jadwal konsultasi online Anda hari ini. Memberikan pelayanan kesehatan terbaik dari mana saja.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-16">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                    <Card className="shadow-lg shadow-slate-200/50 border-0 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-5 md:p-6 relative">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300" />
                            <div className="relative">
                                <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-slate-400" /> Total Sesi
                                </p>
                                <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{stats?.total || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg shadow-teal-200/30 border-0 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-5 md:p-6 relative bg-gradient-to-br from-white to-teal-50/50">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-teal-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300" />
                            <div className="relative">
                                <p className="text-xs md:text-sm font-semibold text-teal-600 mb-1 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-teal-500" /> Aktif
                                </p>
                                <div className="text-3xl md:text-4xl font-black text-teal-700 tracking-tight">{stats?.active || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg shadow-amber-200/30 border-0 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-5 md:p-6 relative bg-gradient-to-br from-white to-amber-50/50">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300" />
                            <div className="relative">
                                <p className="text-xs md:text-sm font-semibold text-amber-600 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" /> Menunggu
                                </p>
                                <div className="text-3xl md:text-4xl font-black text-amber-700 tracking-tight">{stats?.pending || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg shadow-slate-200/50 border-0 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-5 md:p-6 relative">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-slate-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300" />
                            <div className="relative">
                                <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-slate-400" /> Selesai
                                </p>
                                <div className="text-3xl md:text-4xl font-black text-slate-700 tracking-tight">{stats?.closed || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Daftar Konsultasi</h2>

                    {/* Modern Pill Toggles */}
                    <div className="inline-flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide">
                        {['all', 'ACTIVE', 'PENDING', 'CLOSED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`flex-1 md:flex-none whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${statusFilter === tab
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                {tab === 'all' ? 'Semua' : tab.toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Consultation List */}
                <div className="space-y-4">
                    {filteredConsultations.length === 0 ? (
                        <div className="bg-white rounded-3xl border-0 shadow-sm p-16 text-center">
                            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-teal-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada konsultasi</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Anda tidak memiliki sesi konsultasi dengan status ini saat ini.</p>
                        </div>
                    ) : (
                        filteredConsultations.map((consultation: any) => (
                            <div
                                key={consultation.id}
                                className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 cursor-pointer overflow-hidden"
                                onClick={() => navigate(`/doctor/chat/${consultation.id}`)}
                            >
                                {/* Hover Gradient Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100 flex items-center justify-center shadow-inner">
                                                <User className="w-6 h-6 text-teal-600" />
                                            </div>
                                            {consultation.status === 'ACTIVE' && (
                                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                                {consultation.patient?.name || 'Pasien Anonim'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium border border-slate-100">
                                                    ID: {consultation.id.substring(0, 8).toUpperCase()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {format(new Date(consultation.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-6 ml-18 md:ml-0">
                                        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <MessageSquare className="w-4 h-4 text-teal-500" />
                                            {consultation._count?.messages || 0} Chat
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(consultation.status)}

                                            {consultation.payment && (
                                                <span className={`text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${consultation.payment.status === 'PAID'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    Rp {consultation.payment.amount?.toLocaleString('id-ID')} • {consultation.payment.status === 'PAID' ? 'LUNAS' : 'PENDING'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="hidden md:flex w-10 h-10 rounded-full bg-slate-50 group-hover:bg-teal-50 items-center justify-center transition-colors">
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorConsultations;
