import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, User, Clock, MapPin, Plus, History, Activity, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const PatientDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch Appointments
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['my-appointments'],
        queryFn: () => api.appointments.getMy('limit=5&status=PENDING,CONFIRMED,WAITING'),
    });

    const nextAppointment = appointments?.data?.[0];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'WAITING': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 hover:bg-red-200';
            case 'COMPLETED': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Halo, {user.name} 👋</h1>
                    <p className="text-muted-foreground mt-1">
                        Selamat datang di Portal Pasien. Semoga harimu menyenangkan!
                    </p>
                </div>
                <Link to="/appointment">
                    <Button className="shadow-lg hover:shadow-xl transition-all gap-2">
                        <Plus className="w-4 h-4" />
                        Buat Janji Baru
                    </Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Next Appointment & Stats */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Next Appointment Card */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Jadwal Terdekat
                            </h2>
                            <Link to="/patient/appointments" className="text-sm text-primary hover:underline">
                                Lihat Semua
                            </Link>
                        </div>

                        {isLoading ? (
                            <Card className="border-0 shadow-sm bg-gray-50 animate-pulse h-48" />
                        ) : nextAppointment ? (
                            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge className={getStatusColor(nextAppointment.status)}>
                                                    {nextAppointment.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date().toDateString() === new Date(nextAppointment.appointmentDate).toDateString() ? 'Hari Ini' :
                                                        format(new Date(nextAppointment.appointmentDate), 'EEEE, d MMMM yyyy', { locale: idLocale })
                                                    }
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-1">{nextAppointment.poli?.name || 'Poli Umum'}</h3>
                                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                <User className="w-4 h-4" />
                                                <span>{nextAppointment.doctor?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded-lg inline-flex">
                                                <MapPin className="w-3 h-3" />
                                                <span>Gedung Rawat Jalan Lt. 2</span>
                                            </div>
                                        </div>
                                        <div className="text-center bg-primary/5 p-4 rounded-xl min-w-[100px]">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Jam</p>
                                            <p className="text-2xl font-bold text-primary">{nextAppointment.appointmentTime}</p>
                                            <p className="text-xs text-muted-foreground mt-1">WIB</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-dashed bg-gray-50/50">
                                <CardContent className="p-8 text-center">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900">Tidak ada jadwal</h3>
                                    <p className="text-muted-foreground mb-4">Anda belum memiliki jadwal janji temu mendatang.</p>
                                    <Link to="/appointment">
                                        <Button variant="outline">Buat Janji Sekarang</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Quick Stats Grid can go here if we have API for it, currently omitted to keep it clean */}
                </div>

                {/* Right Column: Quick Actions & Profile Preview */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link to="/appointment" className="contents">
                                <div className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer text-center group">
                                    <Plus className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-blue-900">Daftar Poli</span>
                                </div>
                            </Link>
                            <Link to="/patient/appointments" className="contents">
                                <div className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer text-center group">
                                    <History className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-purple-900">Riwayat</span>
                                </div>
                            </Link>
                            <Link to="/patient/profile" className="contents">
                                <div className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer text-center group">
                                    <User className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-orange-900">Profil</span>
                                </div>
                            </Link>
                            <div className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors cursor-pointer text-center group">
                                <Activity className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-green-900">Hasil Lab</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-primary text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Butuh Bantuan?</h3>
                                    <p className="text-sm text-white/80 mb-3">
                                        Hubungi layanan pelanggan kami jika Anda mengalami kendala.
                                    </p>
                                    <Button variant="secondary" size="sm" className="w-full">
                                        Hubungi CS
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
