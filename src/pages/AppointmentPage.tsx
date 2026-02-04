import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Heart,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import Layout from '@/components/layout/Layout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
// import { toast } from 'sonner'; // Original used sonner, but let's stick to useToast if other files use it. Use whatever was there. Original used 'sonner' for toast export but maybe hooks/use-toast in other files? 
// Checking imports, the original file used: import { toast } from 'sonner';
// However, in other files (e.g., PatientLogin.tsx), we used `useToast` from `@/hooks/use-toast`.
// Let's stick with what was in the file originally (sonner) to minimize breakage, OR switch to useToast if consistent.
// The snippet showed `import { toast } from 'sonner';`. I will keep it.
import { toast } from 'sonner';
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { useSettings } from "@/hooks/useSettings";
import AppointmentTicket from '@/components/appointment/AppointmentTicket';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const AppointmentPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');


  const [appointmentResult, setAppointmentResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    medicalRecordNo: '',
  });

  // Parse schedule string like "Senin - Jumat | 08:00 - 14:00"
  // Returns { days: [1,2,3,4,5], start: "08:00", end: "14:00" }
  const parseSchedule = (scheduleStr: string) => {
    try {
      if (!scheduleStr) return { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' }; // Default

      const [dayPart, timePart] = scheduleStr.split('|').map(s => s.trim());

      // Parse Days
      let days: number[] = [];
      const dayMap: { [key: string]: number } = {
        'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6, 'minggu': 0
      };

      const lowerDay = dayPart.toLowerCase();
      if (lowerDay.includes('senin - jumat')) days = [1, 2, 3, 4, 5];
      else if (lowerDay.includes('senin - sabtu')) days = [1, 2, 3, 4, 5, 6];
      else if (lowerDay.includes('setiap hari')) days = [0, 1, 2, 3, 4, 5, 6];
      else {
        // Simple exact match check or fallback
        Object.keys(dayMap).forEach(day => {
          if (lowerDay.includes(day)) days.push(dayMap[day]);
        });
        if (days.length === 0) days = [1, 2, 3, 4, 5]; // Fallback
      }

      // Parse Time
      let start = '08:00';
      let end = '16:00';
      if (timePart) {
        const parts = timePart.split('-').map(s => s.trim());
        if (parts.length === 2) {
          start = parts[0];
          end = parts[1];
        }
      }

      return { days, start, end };
    } catch (e) {
      return { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' };
    }
  };


  // Fetch Services (Polies)
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.services.getAllPublic('isBookable=true'),
  });

  const services = servicesData || [];

  // Fetch Doctors based on service
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
      setStep(4);
      toast.success(t('appointment.success'));
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || t('common.error_desc'));
    },
  });

  const handleNextStep = () => {
    if (step === 1 && selectedService && selectedDoctor) setStep(2);
    else if (step === 2 && selectedDate && selectedTime) setStep(3);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    // Create a new date object with the selected time
    // selectedDate is just the date at 00:00:00 usually. 
    // Actually api expects appointmentDate as ISO string, and time as string "HH:mm".
    const payload = {
      patientName: formData.name,
      patientNIK: formData.nik,
      patientPhone: formData.phone,
      patientEmail: formData.email,
      medicalRecordNo: formData.medicalRecordNo,
      serviceId: selectedService,
      doctorId: selectedDoctor,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      appointmentTime: selectedTime,
    };
    mutation.mutate(payload);
  };




  // 6. Generate Time Slots based on doctor schedule
  // ... (keeping simplified time slots logic or enhancing it)
  // For now, using static time slots but filtering could be added if we had real doctor schedules.
  const doctorSchedule = selectedDoctor ? availableDoctors.find((d: any) => d.id === selectedDoctor)?.schedule : null;
  const parsedSchedule = doctorSchedule ? parseSchedule(doctorSchedule) : { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' };

  // Filter dates in calendar
  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    return !parsedSchedule.days.includes(day) || date < new Date();
  };

  const currentService = services.find((s: any) => s.id === selectedService);
  const currentDoctor = availableDoctors.find((d: any) => d.id === selectedDoctor);

  const canProceedStep1 = selectedService && selectedDoctor;
  const canProceedStep2 = selectedDate && selectedTime;
  const canProceedStep3 = formData.name && formData.nik && formData.phone;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-[#0F766E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            {t('appointment.title')}
          </motion.h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            {t('appointment.subtitle')}
          </p>
        </div>
      </section>

      {/* Appointment Form Section */}
      <section className="py-20 -mt-10">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            {/* Steps Indicator */}
            <div className="bg-slate-50 p-6 border-b border-slate-100">
              <div className="flex items-center justify-center space-x-4 md:space-x-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors relative",
                      step >= i ? "bg-[#0F766E] text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                      {i < 4 && (
                        <div className={cn(
                          "absolute left-10 w-12 md:w-24 h-1 top-1/2 -translate-y-1/2 -z-10",
                          step > i ? "bg-[#0F766E]" : "bg-slate-200"
                        )} />
                      )}
                    </div>
                    <span className={cn(
                      "ml-2 text-sm font-medium hidden md:block",
                      step >= i ? "text-[#0F766E]" : "text-slate-400"
                    )}>
                      {i === 1 && t('appointment.step1')}
                      {i === 2 && t('appointment.step2')}
                      {i === 3 && t('appointment.step3')}
                      {i === 4 && t('appointment.step4')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 md:p-12"
            >
              {/* Step 1: Services & Doctor */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-[#0F766E]" />
                      {t('appointment.select_service')}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {servicesLoading ? (
                        [...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                      ) : (
                        services.map((service: any) => (
                          <button
                            key={service.id}
                            onClick={() => {
                              setSelectedService(service.id);
                              setSelectedDoctor('');
                            }}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all hover:border-[#0F766E]/50 hover:bg-teal-50",
                              selectedService === service.id ? "border-[#0F766E] bg-teal-50 ring-2 ring-[#0F766E]/20" : "border-slate-100"
                            )}
                          >
                            <h3 className="font-bold text-slate-800">{service.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{service.description || 'Layanan Rawat Jalan'}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedService && (
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-[#0F766E]" />
                        {t('appointment.select_doctor')}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctorsLoading ? (
                          [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)
                        ) : availableDoctors.length > 0 ? (
                          availableDoctors.map((doctor: any) => (
                            <button
                              key={doctor.id}
                              onClick={() => setSelectedDoctor(doctor.id)}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-[#0F766E]/50 hover:bg-teal-50",
                                selectedDoctor === doctor.id ? "border-[#0F766E] bg-teal-50 ring-2 ring-[#0F766E]/20" : "border-slate-100"
                              )}
                            >
                              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {doctor.photoUrl ? (
                                  <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800">{doctor.name}</h3>
                                <p className="text-xs text-slate-500">{doctor.specialization}</p>
                                <p className="text-[10px] text-teal-600 mt-1">{doctor.schedule || "Jadwal: Senin - Jumat"}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-slate-500 italic">Tidak ada dokter tersedia untuk poli ini.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      size="lg"
                      onClick={handleNextStep}
                      disabled={!canProceedStep1}
                      className="bg-[#0F766E] hover:bg-[#0d655e]"
                    >
                      {t('common.next')} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#0F766E]" />
                        Pilih Tanggal
                      </Label>
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        className="rounded-xl border shadow-sm mx-auto md:mx-0"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#0F766E]" />
                        Pilih Jam
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots
                          .filter(time => {
                            if (!parsedSchedule) return true;
                            return time >= parsedSchedule.start && time < parsedSchedule.end;
                          })
                          .map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              disabled={!selectedDate}
                              className={cn(
                                "py-2 px-4 rounded-lg text-sm font-medium transition-all border",
                                selectedTime === time
                                  ? "bg-[#0F766E] text-white border-[#0F766E]"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-[#0F766E] hover:text-[#0F766E]",
                                !selectedDate && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" size="lg" onClick={handlePrevStep}>
                      <ArrowLeft className="mr-2 w-4 h-4" /> {t('common.back')}
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleNextStep}
                      disabled={!canProceedStep2}
                      className="bg-[#0F766E] hover:bg-[#0d655e]"
                    >
                      {t('common.next')} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Patient Details */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 mb-8">
                    <h4 className="font-semibold text-[#0F766E] mb-4">Ringkasan Pilihan:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block mb-1">Layanan</span>
                        <span className="font-medium text-slate-900">{currentService?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Dokter</span>
                        <span className="font-medium text-slate-900">{currentDoctor?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Tanggal</span>
                        <span className="font-medium text-slate-900">{selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: id }) : '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Jam</span>
                        <span className="font-medium text-slate-900">{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK (Nomor Induk Kependudukan)</Label>
                      <Input
                        id="nik"
                        required
                        placeholder="Contoh: 3578..."
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        maxLength={16}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Sesuai KTP"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. WhatsApp</Label>
                      <Input
                        id="phone"
                        required
                        type="tel"
                        placeholder="Contoh: 0812..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Opsional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@contoh.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mr" className="text-slate-500">Nomor Rekam Medis (Jika Ada)</Label>
                    <Input
                      id="mr"
                      placeholder="Kosongkan jika pasien baru"
                      value={formData.medicalRecordNo}
                      onChange={(e) => setFormData({ ...formData, medicalRecordNo: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" size="lg" onClick={handlePrevStep}>
                      <ArrowLeft className="mr-2 w-4 h-4" /> {t('common.back')}
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!canProceedStep3 || mutation.isPending}
                      className="bg-[#0F766E] hover:bg-[#0d655e]"
                    >
                      {mutation.isPending ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memproses...</>) : (<>Konfirmasi Janji Temu <CheckCircle className="ml-2 w-4 h-4" /></>)}
                    </Button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div className="flex flex-col items-center py-6">

                  <AppointmentTicket
                    appointment={appointmentResult?.data || appointmentResult}
                    patientName={formData.name}
                    serviceName={services.find((s: any) => s.id === selectedService)?.name}
                    settings={settings}
                  />

                  <div className="mt-4 w-full max-w-sm">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        setSelectedService('');
                        setSelectedDoctor('');
                        setSelectedDate(undefined);
                        setSelectedTime('');
                        setFormData({ name: '', nik: '', phone: '', email: '', medicalRecordNo: '' });
                      }}
                      className="w-full"
                    >
                      Buat Janji Baru
                    </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AppointmentPage;
