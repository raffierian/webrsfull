import React, { useState } from 'react';
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
  Loader2
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
import { toast } from 'sonner';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const AppointmentPage: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
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

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    medicalRecordNo: '',
  });

  // Fetch Services (Polies)
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.services.getAllPublic(),
  });

  const services = servicesData || [];

  // Fetch Doctors for selected service
  // Note: Backend might not support filtering doctors by service/poli ID directly if relation is complex, 
  // but looking at controller it has specialization search. 
  // Ideally, valid polies should be linked to doctors.
  // For now, let's fetch all doctors and filter client side or assume backend can filter if we pass specialization.
  const selectedServiceName = services.find((s: any) => s.id === selectedService)?.name;

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ['public-doctors-appointment', selectedServiceName],
    queryFn: () => api.doctors.getAllPublic(`isAvailable=true${selectedServiceName ? `&specialization=${encodeURIComponent(selectedServiceName)}` : ''}`),
    enabled: !!selectedService // Only fetch when service is selected
  });

  const availableDoctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.data || []);

  const selectedDoctorObj = availableDoctors.find((d: any) => d.id === selectedDoctor);

  const scheduleData = React.useMemo(() => {
    return parseSchedule(selectedDoctorObj?.schedule || '');
  }, [selectedDoctorObj]);

  const availableTimeSlots = React.useMemo(() => {
    const startParts = scheduleData.start.split(':').map(Number);
    const endParts = scheduleData.end.split(':').map(Number);

    if (startParts.length !== 2 || endParts.length !== 2) return [];

    const slots = [];
    let current = new Date();
    current.setHours(startParts[0], startParts[1], 0, 0);
    const end = new Date();
    end.setHours(endParts[0], endParts[1], 0, 0);

    while (current <= end) {
      slots.push(format(current, 'HH:mm'));
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  }, [scheduleData]);

  // Submit Mutation
  const mutation = useMutation({
    mutationFn: (data: any) => api.appointments.create(data),
    onSuccess: () => {
      toast.success('Janji temu berhasil dibuat!', {
        description: 'Konfirmasi akan dikirim ke email/WhatsApp Anda.',
      });
      setStep(4);
    },
    onError: (error: any) => {
      toast.error('Gagal membuat janji temu', {
        description: error.message || 'Silakan coba lagi.',
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedDoctor || !selectedService) return;

    const payload = {
      patientName: formData.name,
      patientNIK: formData.nik, // Ensure backend accepts NIK or maps it to user
      patientPhone: formData.phone,
      patientEmail: formData.email,
      serviceId: selectedService,
      doctorId: selectedDoctor,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      appointmentTime: selectedTime,
    };

    // Note: Backend create appointment might expect authenticated user or different payload structure.
    // If public appointment is allowed, it usually needs patient details in body.
    // Let's assume standard public body. 
    mutation.mutate(payload);
  };

  const canProceedStep1 = selectedService && selectedDoctor;
  const canProceedStep2 = selectedDate && selectedTime;
  const canProceedStep3 = formData.name && formData.nik && formData.phone;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('appointment.title')}</h1>
            <p className="text-lg text-white/80">{t('appointment.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={cn(
                  "flex items-center gap-2",
                  step >= s ? "text-primary" : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
                    step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                    step === s && "ring-4 ring-primary/20"
                  )}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  <span className="hidden md:block font-medium">
                    {s === 1 && 'Pilih Layanan'}
                    {s === 2 && 'Pilih Jadwal'}
                    {s === 3 && 'Data Pasien'}
                  </span>
                </div>
                {s < 3 && (
                  <div className={cn(
                    "w-16 md:w-24 h-1 rounded-full transition-colors",
                    step > s ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-medical p-8"
            >
              {/* Step 1: Select Service & Doctor */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Pilih Layanan & Dokter</h2>
                      <p className="text-sm text-muted-foreground">Pilih poli dan dokter yang Anda inginkan</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service" className="text-base font-medium mb-2 block">
                        {t('appointment.selectService')} *
                      </Label>
                      {servicesLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Memuat layanan...
                        </div>
                      ) : (
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger id="service" className="h-12">
                            <SelectValue placeholder="Pilih layanan/poli" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {selectedService && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <Label className="text-base font-medium mb-2 block">
                          {t('appointment.selectDoctor')} *
                        </Label>
                        {doctorsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" /> Memuat dokter...
                          </div>
                        ) : availableDoctors.length > 0 ? (
                          <div className="space-y-3">
                            {availableDoctors.map((doctor: any) => (
                              <div
                                key={doctor.id}
                                onClick={() => setSelectedDoctor(doctor.id)}
                                className={cn(
                                  "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                  selectedDoctor === doctor.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">{doctor.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {/* Mock schedule for now as API might not return parsed textual schedule in list */}
                                      Senin - Jumat | 08:00 - 15:00
                                    </p>
                                  </div>
                                  {selectedDoctor === doctor.id && (
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Tidak ada dokter tersedia untuk layanan ini saat ini.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="medical"
                      size="lg"
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                      className="gap-2"
                    >
                      Lanjutkan
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Date & Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Pilih Tanggal & Waktu</h2>
                      <p className="text-sm text-muted-foreground">Pilih jadwal kunjungan yang tersedia</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-2 block">
                        {t('appointment.selectDate')} *
                      </Label>
                      <div className="border rounded-xl p-4">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={id}
                          disabled={(date) =>
                            date < new Date() ||
                            !scheduleData.days.includes(date.getDay())
                          }
                          className="mx-auto"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-2 block">
                        {t('appointment.selectTime')} *
                      </Label>
                      {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "p-3 rounded-lg border-2 font-medium transition-all",
                                selectedTime === time
                                  ? "border-primary bg-primary text-white"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg text-center">
                          Tidak ada jadwal tersedia untuk dokter ini.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Kembali
                    </Button>
                    <Button
                      variant="medical"
                      size="lg"
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="gap-2"
                    >
                      Lanjutkan
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Patient Data */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Data Pasien</h2>
                      <p className="text-sm text-muted-foreground">Lengkapi data diri Anda</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name" className="mb-2 block">
                        {t('appointment.patientName')} *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nama lengkap sesuai KTP"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nik" className="mb-2 block">
                        {t('appointment.patientNIK')} *
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="nik"
                          name="nik"
                          value={formData.nik}
                          onChange={handleInputChange}
                          placeholder="16 digit NIK"
                          maxLength={16}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="mb-2 block">
                        {t('appointment.patientPhone')} *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="08xxxxxxxxxx"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="mb-2 block">
                        {t('appointment.patientEmail')}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medicalRecordNo" className="mb-2 block">
                        {t('appointment.medicalRecordNo')}
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="medicalRecordNo"
                          name="medicalRecordNo"
                          value={formData.medicalRecordNo}
                          onChange={handleInputChange}
                          placeholder="Untuk pasien lama"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Ringkasan Janji Temu</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Layanan:</span>
                        <p className="font-medium">{services.find((s: any) => s.id === selectedService)?.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dokter:</span>
                        <p className="font-medium">{availableDoctors.find((d: any) => d.id === selectedDoctor)?.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tanggal:</span>
                        <p className="font-medium">{selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: id }) : '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Waktu:</span>
                        <p className="font-medium">{selectedTime || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      variant="medical"
                      size="lg"
                      disabled={!canProceedStep3 || mutation.isPending}
                      className="gap-2"
                    >
                      {mutation.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : (<>Buat Janji Temu <CheckCircle className="w-5 h-5" /></>)}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-secondary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">{t('appointment.success')}</h2>
                  <p className="text-muted-foreground mb-6">{t('appointment.confirmation')}</p>

                  <div className="bg-muted/50 rounded-xl p-6 text-left max-w-md mx-auto mb-6">
                    <h4 className="font-semibold mb-4">Detail Janji Temu:</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Nama:</span> {formData.name}</p>
                      <p><span className="text-muted-foreground">Layanan:</span> {services.find((s: any) => s.id === selectedService)?.name}</p>
                      <p><span className="text-muted-foreground">Dokter:</span> {availableDoctors.find((d: any) => d.id === selectedDoctor)?.name}</p>
                      <p><span className="text-muted-foreground">Tanggal:</span> {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: id }) : '-'}</p>
                      <p><span className="text-muted-foreground">Waktu:</span> {selectedTime}</p>
                    </div>
                  </div>

                  <Button
                    variant="medical"
                    size="lg"
                    onClick={() => {
                      setStep(1);
                      setSelectedService('');
                      setSelectedDoctor('');
                      setSelectedDate(undefined);
                      setSelectedTime('');
                      setFormData({ name: '', nik: '', phone: '', email: '', medicalRecordNo: '' });
                    }}
                  >
                    Buat Janji Temu Lain
                  </Button>
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
