import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageSquare, Clock, CheckCircle, User, Calendar } from 'lucide-react';
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
        const config: Record<string, { variant: any; label: string; icon: any }> = {
            PENDING: { variant: 'secondary', label: 'Menunggu', icon: Clock },
            ACTIVE: { variant: 'default', label: 'Aktif', icon: MessageSquare },
            CLOSED: { variant: 'outline', label: 'Selesai', icon: CheckCircle }
        };
        const { variant, label, icon: Icon } = config[status] || config.PENDING;
        return (
            <Badge variant={variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    const filteredConsultations = Array.isArray(consultations) ? consultations : [];

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Konsultasi Saya</h1>
                <p className="text-slate-600 mt-1">Kelola konsultasi online dengan pasien</p>
            </div>

            {/* Stats Cards - Horizontal Scroll on Mobile */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-6 snap-x snap-mandatory scrollbar-hide">
                <Card className="min-w-[160px] snap-start">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Total</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card className="min-w-[160px] snap-start">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Aktif</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-teal-600">{stats?.active || 0}</div>
                    </CardContent>
                </Card>
                <Card className="min-w-[160px] snap-start">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Menunggu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                    </CardContent>
                </Card>
                <Card className="min-w-[160px] snap-start">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Selesai</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-600">{stats?.closed || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="ACTIVE">Aktif</TabsTrigger>
                    <TabsTrigger value="PENDING">Pending</TabsTrigger>
                    <TabsTrigger value="CLOSED">Selesai</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Consultation List */}
            <div className="space-y-3">
                {filteredConsultations.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">Belum ada konsultasi</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredConsultations.map((consultation: any) => (
                        <Card
                            key={consultation.id}
                            className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                            onClick={() => navigate(`/doctor/chat/${consultation.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {consultation.patient?.name || 'Pasien'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {consultation.patient?.phone || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(consultation.status)}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {format(new Date(consultation.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{consultation._count?.messages || 0} pesan</span>
                                    </div>
                                </div>

                                {consultation.payment && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Pembayaran:</span>
                                            <Badge variant={consultation.payment.status === 'PAID' ? 'default' : 'secondary'}>
                                                {consultation.payment.status === 'PAID' ? 'Lunas' : 'Pending'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default DoctorConsultations;
