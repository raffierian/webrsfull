import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AppointmentTicket from '@/components/appointment/AppointmentTicket';
import { useSettings } from "@/hooks/useSettings";
import { Link } from 'react-router-dom';

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const PatientNewAppointment: React.FC = () => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentResult, setAppointmentResult] = useState<any>(null);

    // User Data from LocalStorage
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const parseSchedule = (scheduleStr: string) => {
        try {
            if (!scheduleStr) return { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' };
            const [dayPart, timePart] = scheduleStr.split('|').map(s => s.trim());
            let days: number[] = [];
            const dayMap: { [key: string]: number } = {
                'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6, 'minggu': 0
            };
            const lowerDay = dayPart.toLowerCase();
            if (lowerDay.includes('senin - jumat')) days = [1, 2, 3, 4, 5];
            else if (lowerDay.includes('senin - sabtu')) days = [1, 2, 3, 4, 5, 6];
            // ... simple parsing logic
            else {
                Object.keys(dayMap).forEach(day => {
                    if (lowerDay.includes(day)) days.push(dayMap[day]);
                });
                if (days.length === 0) days = [1, 2, 3, 4, 5];
            }
            return { days, start: '08:00', end: '16:00' }; // simplified time for now
        } catch {
            return { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' };
        }
    };

    // Fetch Services
    const { data: servicesData, isLoading: servicesLoading } = useQuery({
        queryKey: ['public-services'],
        queryFn: () => api.services.getAllPublic('isBookable=true'),
    });
    const services = servicesData || [];

    // Fetch Doctors
    const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
        queryKey: ['doctors', selectedService],
        queryFn: () => api.doctors.getByService(selectedService),
        enabled: !!selectedService,
    });
    const availableDoctors = doctorsData || [];

    const mutation = useMutation({
        mutationFn: (data: any) => api.appointments.create(data),
        onSuccess: (data) => {
            setAppointmentResult(data);
            setStep(3); // Success Step
            toast.success(t('appointment.success'));
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal membuat janji temu");
        },
    });

    const handleNextStep = () => {
        if (step === 1 && selectedService && selectedDoctor) setStep(2);
        // Step 2 Next -> Submit directly or Confirmation? 
        // Let's add confirmation as Step 2.5? Or just submit.
        // Let's keep 3 steps: 1. Service/Doc, 2. Date/Time, 3. Success.
        // Wait, where is confirmation?
    };

    const handleSubmit = () => {
        if (!selectedDate || !user) return;

        // We need to pass patient details even if logged in?
        // The backend `createAppointment` checks if `req.user` exists?
        // If public API used, it expects `patientName`, etc.
        // If we use a protected API, it might pull from `req.user`.
        // Let's check `appointments.controller.js`... 
        // Assuming we use the SAME public endpoint for now, but with user data pre-filled.

        const payload = {
            patientName: user.name,
            patientNIK: user.nik || '1234567890123456', // Fallback or force update profile?
            patientPhone: user.phone || '08123456789',
            patientEmail: user.email,
            medicalRecordNo: user.medicalRecordNo,
            serviceId: selectedService,
            doctorId: selectedDoctor,
            appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
            appointmentTime: selectedTime,
            userId: user.id // Optional if backend handles it
        };
        mutation.mutate(payload);
    };

    const doctorSchedule = selectedDoctor ? availableDoctors.find((d: any) => d.id === selectedDoctor)?.schedule : null;
    const parsedSchedule = doctorSchedule ? parseSchedule(doctorSchedule) : { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' };
    const isDateDisabled = (date: Date) => {
        const day = date.getDay();
        return !parsedSchedule.days.includes(day) || date < new Date();
    };

    const canProceedStep1 = selectedService && selectedDoctor;
    const canProceedStep2 = selectedDate && selectedTime;

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Buat Janji Temu</h1>
                <p className="text-muted-foreground mt-1">Isi formulir berikut untuk menjadwalkan konsultasi medis Anda.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Step Indicator */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex items-center justify-center max-w-3xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center w-full last:w-auto">
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300",
                                        step >= i ? "border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "border-slate-200 bg-white text-slate-400"
                                    )}>
                                        {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-medium mt-2 absolute -bottom-6 w-32 text-center",
                                        step >= i ? "text-teal-700" : "text-slate-400"
                                    )}>
                                        {i === 1 ? "Pilih Layanan" : i === 2 ? "Waktu Kunjungan" : "Selesai"}
                                    </span>
                                </div>
                                {i < 3 && (
                                    <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative -top-3">
                                        <div
                                            className="absolute inset-0 bg-teal-600 transition-all duration-500"
                                            style={{ width: step > i ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="h-6" /> {/* Spacing for labels */}
                </div>

                <div className="p-6 md:p-8 min-h-[500px]">
                    {/* Step 1 */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5" />
                                        </span>
                                        Pilih Layanan / Poli
                                    </Label>
                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {servicesLoading ? (
                                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)
                                        ) : (
                                            services.map((svc: any) => (
                                                <div
                                                    key={svc.id}
                                                    onClick={() => { setSelectedService(svc.id); setSelectedDoctor(''); }}
                                                    className={cn(
                                                        "group p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
                                                        selectedService === svc.id
                                                            ? "border-teal-600 bg-teal-50/50 shadow-sm"
                                                            : "border-slate-100 hover:border-teal-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-center relative z-10">
                                                        <div>
                                                            <div className={cn("font-bold text-base transition-colors", selectedService === svc.id ? "text-teal-700" : "text-slate-700")}>
                                                                {svc.name}
                                                            </div>
                                                            {svc.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{svc.description}</div>}
                                                        </div>
                                                        {selectedService === svc.id && (
                                                            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedService === svc.id && <div className="absolute inset-y-0 left-0 w-1 bg-teal-600" />}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </span>
                                        Pilih Dokter
                                    </Label>
                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {doctorsLoading ? (
                                            [1, 2].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />)
                                        ) : !selectedService ? (
                                            <div className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                                <Stethoscope className="w-12 h-12 text-slate-200 mb-3" />
                                                <p className="text-slate-500 font-medium">Silakan pilih layanan terlebih dahulu</p>
                                            </div>
                                        ) : availableDoctors.length > 0 ? (
                                            availableDoctors.map((doc: any) => (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => setSelectedDoctor(doc.id)}
                                                    className={cn(
                                                        "group flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
                                                        selectedDoctor === doc.id
                                                            ? "border-teal-600 bg-teal-50/50 shadow-sm"
                                                            : "border-slate-100 hover:border-teal-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm relative z-10">
                                                        {doc.photoUrl ? (
                                                            <img src={doc.photoUrl} alt={doc.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 relative z-10">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className={cn("font-bold text-slate-800 group-hover:text-teal-700 transition-colors", selectedDoctor === doc.id && "text-teal-700")}>
                                                                    {doc.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full">{doc.specialization}</div>
                                                            </div>
                                                            {selectedDoctor === doc.id && (
                                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                                                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                                                            {doc.schedule || "Senin - Jumat | 08:00 - 16:00"}
                                                        </div>
                                                    </div>
                                                    {selectedDoctor === doc.id && <div className="absolute inset-y-0 left-0 w-1 bg-teal-600" />}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50">
                                                <p className="text-slate-500 italic">Tidak ada dokter tersedia untuk layanan ini.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedStep1}
                                    size="lg"
                                    className={cn(
                                        "gap-2 transition-all",
                                        canProceedStep1 ? "shadow-lg shadow-teal-600/20" : ""
                                    )}
                                >
                                    Lanjut <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid md:grid-cols-12 gap-8">
                                <div className="md:col-span-5 space-y-4">
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                            <Calendar className="w-5 h-5" />
                                        </span>
                                        Pilih Tanggal
                                    </Label>
                                    <div className="border rounded-2xl p-4 shadow-sm bg-white inline-block w-full">
                                        <CalendarComponent
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={isDateDisabled}
                                            className="mx-auto"
                                            classNames={{
                                                day_selected: "bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white",
                                                day_today: "bg-slate-100 text-slate-900",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-7 space-y-4">
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                            <Clock className="w-5 h-5" />
                                        </span>
                                        Pilih Jam Kunjungan
                                    </Label>

                                    {!selectedDate ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                            <Calendar className="w-12 h-12 text-slate-200 mb-3" />
                                            <p className="text-slate-500 font-medium">Pilih tanggal di kalender terlebih dahulu</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={cn(
                                                        "py-3 px-2 rounded-xl text-sm font-medium transition-all border relative overflow-hidden group",
                                                        selectedTime === time
                                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                                                            : "bg-white text-slate-700 border-slate-100 hover:border-teal-500 hover:text-teal-600"
                                                    )}
                                                >
                                                    {time}
                                                    {selectedTime === time && (
                                                        <div className="absolute top-0 right-0 p-1">
                                                            <div className="w-2 h-2 rounded-full bg-white opacity-50" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedDate && selectedTime && (
                                        <div className="mt-8 bg-teal-50 border border-teal-100 rounded-2xl p-6">
                                            <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-teal-600" />
                                                Konfirmasi Detail
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <span className="text-teal-600/70 block text-xs uppercase tracking-wider font-semibold">Pasien</span>
                                                    <span className="font-bold text-slate-900 text-base">{user?.name}</span>
                                                    <span className="text-slate-500 block">{user?.nik || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-teal-600/70 block text-xs uppercase tracking-wider font-semibold">Layanan</span>
                                                    <span className="font-bold text-slate-900 text-base">{services.find((s: any) => s.id === selectedService)?.name}</span>
                                                    <span className="text-slate-500 block">{availableDoctors.find((d: any) => d.id === selectedDoctor)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <Button variant="outline" size="lg" onClick={() => setStep(1)} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canProceedStep2 || mutation.isPending}
                                    size="lg"
                                    className={cn(
                                        "gap-2 min-w-[200px]",
                                        mutation.isPending ? "opacity-80" : "shadow-lg shadow-teal-600/20"
                                    )}
                                >
                                    {mutation.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...</>) : 'Konfirmasi Janji Temu'}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && appointmentResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Janji Temu Berhasil!</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Terima kasih, janji temu Anda telah terkonfirmasi. Silakan simpan E-Tiket di bawah ini.
                            </p>

                            <div className="max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
                                <AppointmentTicket
                                    appointment={appointmentResult?.data || appointmentResult}
                                    patientName={user?.name}
                                    serviceName={services.find((s: any) => s.id === selectedService)?.name}
                                    settings={settings}
                                />
                            </div>

                            <div className="mt-10 space-x-4">
                                <Link to="/patient/appointments">
                                    <Button variant="outline" size="lg">Lihat Riwayat</Button>
                                </Link>
                                <Button
                                    size="lg"
                                    onClick={() => {
                                        setStep(1);
                                        setSelectedService('');
                                        setSelectedDoctor('');
                                        setSelectedDate(undefined);
                                        setSelectedTime('');
                                    }}
                                >
                                    Buat Janji Lagi
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientNewAppointment;
