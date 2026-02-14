import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Video, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

const PatientConsultationPage = () => {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<'chat' | 'video'>('chat');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [complaint, setComplaint] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const isConsultationEnabled = settings?.consultationEnabled !== false && settings?.external_links?.consultationEnabled !== false;

    // Fetch available doctors
    const { data: doctors, isLoading } = useQuery({
        queryKey: ['doctors-for-consultation'],
        queryFn: () => api.doctors.getAllPublic('?limit=100&isAvailable=true')
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDoctorId) {
            toast.error('Pilih dokter terlebih dahulu');
            return;
        }

        if (selectedType === 'chat') {
            try {
                setIsProcessing(true);

                console.log('Creating session for doctor:', selectedDoctorId);
                const sessionData = await api.consultationChat.createSession(selectedDoctorId);

                console.log('Session data:', {
                    id: sessionData.id,
                    requiresPayment: sessionData.requiresPayment,
                    isPaid: sessionData.isPaid,
                    consultationFee: sessionData.consultationFee
                });

                // Always redirect to payment page for unpaid sessions
                // requiresPayment is true when isPaid is false
                if (sessionData.requiresPayment) {
                    // Redirect to payment page
                    console.log('Redirecting to payment page with session ID:', sessionData.id);
                    toast.info('Silakan selesaikan pembayaran terlebih dahulu');
                    navigate(`/patient/consultation/payment/${sessionData.id}`, {
                        state: { consultationFee: sessionData.consultationFee }
                    });
                } else {
                    // Already paid, go directly to chat
                    console.log('Session already paid, redirecting to chat:', sessionData.id);
                    toast.success('Sesi konsultasi aktif!');
                    navigate(`/patient/consultation/chat/${sessionData.id}`);
                }
            } catch (error: any) {
                console.error('Error creating session:', error);
                toast.error(error.message || 'Gagal memulai konsultasi');
            } finally {
                setIsProcessing(false);
            }
        } else {
            toast.info('Fitur Video Call belum tersedia');
        }
    };

    const selectedDoctor = doctors?.find((d: any) => d.id === selectedDoctorId);

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Konsultasi Online</h1>
                <p className="text-slate-600 mt-2">Konsultasi dengan dokter secara online melalui chat atau video call</p>
            </div>

            {!isConsultationEnabled ? (
                <Card className="text-center py-12 px-6 border-dashed border-2">
                    <CardHeader>
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10 text-orange-600" />
                        </div>
                        <CardTitle className="text-2xl">Layanan Tidak Tersedia</CardTitle>
                        <CardDescription className="max-w-md mx-auto text-base">
                            Mohon maaf, layanan konsultasi online sedang tidak tersedia saat ini.
                            Silakan coba lagi nanti atau hubungi customer service kami.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/patient/dashboard')}
                            className="mt-4"
                        >
                            Kembali ke Dashboard
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Pilih Jenis Konsultasi</CardTitle>
                            <CardDescription>Pilih metode konsultasi yang Anda inginkan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedType('chat')}
                                    className={`p-6 rounded-xl border-2 transition-all ${selectedType === 'chat'
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <MessageSquare className={`w-8 h-8 mx-auto mb-3 ${selectedType === 'chat' ? 'text-teal-600' : 'text-slate-400'
                                        }`} />
                                    <h3 className="font-semibold text-slate-800">Chat Dokter</h3>
                                    <p className="text-sm text-slate-600 mt-1">Konsultasi via chat real-time</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedType('video')}
                                    className={`p-6 rounded-xl border-2 transition-all ${selectedType === 'video'
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    disabled
                                >
                                    <Video className={`w-8 h-8 mx-auto mb-3 ${selectedType === 'video' ? 'text-teal-600' : 'text-slate-400'
                                        }`} />
                                    <h3 className="font-semibold text-slate-800">Video Call</h3>
                                    <p className="text-sm text-slate-600 mt-1">Segera hadir</p>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedType === 'chat' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Konsultasi</CardTitle>
                                <CardDescription>Lengkapi informasi untuk memulai konsultasi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="doctor">Pilih Dokter *</Label>
                                    <Select required value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih dokter untuk konsultasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoading ? (
                                                <div className="p-4 text-center text-sm text-slate-500">
                                                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                                    Memuat dokter...
                                                </div>
                                            ) : doctors && doctors.length > 0 ? (
                                                doctors.map((doctor: any) => (
                                                    <SelectItem key={doctor.id} value={doctor.id}>
                                                        {doctor.name} - {doctor.specialization}
                                                        {doctor.consultationFee && (
                                                            <span className="text-xs text-slate-500 ml-2">
                                                                (Rp {Number(doctor.consultationFee).toLocaleString('id-ID')})
                                                            </span>
                                                        )}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-slate-500">
                                                    Tidak ada dokter tersedia
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedDoctor && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-blue-900 mb-2">Biaya Konsultasi</h4>
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rp {Number(selectedDoctor.consultationFee || 50000).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">Pembayaran dilakukan sebelum chat dimulai</p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="complaint">Keluhan (Opsional)</Label>
                                    <Textarea
                                        id="complaint"
                                        value={complaint}
                                        onChange={(e) => setComplaint(e.target.value)}
                                        placeholder="Jelaskan keluhan Anda secara singkat..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-teal-600 hover:bg-teal-700"
                                    disabled={isProcessing || !selectedDoctorId}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Lanjut ke Pembayaran'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </form>
            )}

            {/* Recent Consultations List */}
            <RecentConsultations />
        </div>
    );
};

const RecentConsultations = () => {
    const navigate = useNavigate();
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['my-total-sessions'],
        queryFn: () => api.consultationChat.getMySessions(),
    });

    if (isLoading) return <div className="mt-8 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>;
    if (!sessions || sessions.length === 0) return null;

    return (
        <div className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Riwayat & Daftar Pendaftaran</h2>
            <div className="grid gap-4">
                {sessions.map((session: any) => (
                    <Card key={session.id} className="border-slate-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{session.doctor?.name || 'Dokter'}</h3>
                                    <p className="text-xs text-slate-500">{session.doctor?.specialization}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {session.payment?.paymentProof && session.payment?.status === 'PENDING' ? (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px]">
                                                Menunggu Konfirmasi
                                            </Badge>
                                        ) : (
                                            <Badge variant={session.isPaid ? 'default' : 'secondary'} className="text-[10px]">
                                                {session.isPaid ? 'Lunas' : 'Menunggu Bayar'}
                                            </Badge>
                                        )}
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {session.id.slice(0, 8)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant={session.isPaid ? 'outline' : 'default'}
                                onClick={() => navigate(
                                    session.isPaid
                                        ? `/patient/consultation/chat/${session.id}`
                                        : `/patient/consultation/payment/${session.id}`
                                )}
                            >
                                {session.isPaid ? 'Lihat Chat' : 'Bayar Sekarang'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PatientConsultationPage;
