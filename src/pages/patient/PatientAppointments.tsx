import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, FileText, Search, Filter, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/useSettings';

const PatientAppointments = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const { settings } = useSettings();

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['my-appointments', activeTab],
        queryFn: () => api.appointments.getMy('limit=50'),
    });

    const upcomingList = appointments?.data?.filter((app: any) =>
        ['PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS'].includes(app.status)
    ) || [];

    const historyList = appointments?.data?.filter((app: any) =>
        ['COMPLETED', 'CANCELLED'].includes(app.status)
    ) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'WAITING': return 'bg-blue-100 text-blue-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const AppointmentCard = ({ appointment }: { appointment: any }) => (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Box */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-24 h-24 bg-primary/5 rounded-xl text-center">
                        <span className="text-sm font-medium text-primary uppercase">
                            {format(new Date(appointment.appointmentDate), 'MMM', { locale: idLocale })}
                        </span>
                        <span className="text-3xl font-bold text-gray-800">
                            {format(new Date(appointment.appointmentDate), 'dd')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(appointment.appointmentDate), 'yyyy')}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{appointment.poli?.name}</h3>
                                <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                    <User className="w-4 h-4" />
                                    dr. {appointment.doctor?.name}
                                </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{appointment.appointmentTime} WIB - No. Antrian: <span className="font-bold">#{appointment.queueNumber}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{settings?.name || "RS Harapan Sehat"}</span>
                            </div>
                        </div>

                        {appointment.complaint && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                                <span className="font-medium text-gray-700">Keluhan: </span>
                                <span className="text-gray-600">{appointment.complaint}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Janji Temu Saya</h1>
                    <p className="text-muted-foreground">Kelola jadwal konsultasi dan riwayat kunjungan Anda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                        <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="upcoming">Akan Datang ({upcomingList.length})</TabsTrigger>
                    <TabsTrigger value="history">Riwayat ({historyList.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />)}
                        </div>
                    ) : upcomingList.length > 0 ? (
                        upcomingList.map((app: any) => (
                            <AppointmentCard key={app.id} appointment={app} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Tidak ada jadwal mendatang</h3>
                            <p className="text-muted-foreground mb-6">Anda belum memiliki jadwal konsultasi yang akan datang.</p>
                            <Button>Buat Janji Baru</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />)}
                        </div>
                    ) : historyList.length > 0 ? (
                        historyList.map((app: any) => (
                            <AppointmentCard key={app.id} appointment={app} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900">Belum ada riwayat</h3>
                            <p className="text-muted-foreground">Riwayat kunjungan Anda akan muncul di sini.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PatientAppointments;
