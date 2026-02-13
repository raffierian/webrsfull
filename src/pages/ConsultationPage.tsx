import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  MessageCircle,
  Video,
  Phone,
  Clock,
  Shield,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const consultationTypes = [
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'Chat Dokter',
    description: 'Konsultasi via chat dengan dokter',
    price: 'Rp 50.000',
    duration: '30 menit',
    features: ['Respons dalam 5 menit', 'Riwayat chat tersimpan', 'Resep digital'],
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video Call',
    description: 'Konsultasi tatap muka virtual',
    price: 'Rp 100.000',
    duration: '30 menit',
    features: ['Face-to-face virtual', 'Kualitas HD', 'Rekaman tersedia'],
    popular: true,
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Telepon',
    description: 'Konsultasi via telepon',
    price: 'Rp 75.000',
    duration: '20 menit',
    features: ['Mudah & praktis', 'Tanpa aplikasi', 'Panggilan langsung'],
  },
];

const ConsultationPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [step, setStep] = useState(1);

  // Resume Session State
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);
  const [resumeDoctorName, setResumeDoctorName] = useState<string>('');

  // Fetch settings to check if consultation is enabled
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.getAll(),
  });

  const isConsultationEnabled = settings?.consultationEnabled ?? settings?.external_links?.consultationEnabled ?? true;

  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Fetch available doctors for chat consultation
  const { data: doctors } = useQuery({
    queryKey: ['doctors-for-chat'],
    queryFn: () => api.doctors.getAllPublic('?limit=100'),
    enabled: selectedType === 'chat' && step === 2
  });

  // Check for unpaid sessions
  const { data: unpaidSessions } = useQuery({
    queryKey: ['my-unpaid-sessions'],
    queryFn: () => api.consultationChat.getMySessions('status=OPEN&isPaid=false'),
    enabled: !!localStorage.getItem('token'), // Only run if logged in
    retry: false
  });

  useEffect(() => {
    if (unpaidSessions && unpaidSessions.length > 0) {
      // Take the most recent one
      const session = unpaidSessions[0];
      setResumeSessionId(session.id);
      setResumeDoctorName(session.doctor?.name || 'Dokter');
      setResumeDialogOpen(true);
    }
  }, [unpaidSessions]);

  const handleResume = () => {
    if (resumeSessionId) {
      navigate(`/patient/consultation/payment/${resumeSessionId}`);
    }
    setResumeDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For Chat Consultation
    if (selectedType === 'chat') {
      try {
        setIsProcessing(true);

        // Use selected doctor from dropdown or first available doctor
        const doctorId = selectedDoctorId || doctors?.[0]?.id;

        if (!doctorId) {
          toast.error('Tidak ada dokter yang tersedia saat ini.');
          return;
        }

        // Create session (and account if guest)
        const response = await api.consultationChat.createSession(doctorId, {
          name: (document.getElementById('name') as HTMLInputElement)?.value,
          email: (document.getElementById('email') as HTMLInputElement)?.value,
          phone: (document.getElementById('phone') as HTMLInputElement)?.value,
          nik: (document.getElementById('nik') as HTMLInputElement)?.value,
          dateOfBirth: (document.getElementById('dateOfBirth') as HTMLInputElement)?.value,
          gender: (document.getElementById('gender') as HTMLInputElement)?.value,
          complaint: (document.getElementById('complaint') as HTMLTextAreaElement)?.value
        });

        // Auto-login if token returned
        if (response.authToken && response.user) {
          localStorage.setItem('token', response.authToken);
          localStorage.setItem('user', JSON.stringify(response.user));

          // Show credentials if new account created
          if (response.user.tempPassword) {
            toast.success('Akun berhasil dibuat!', {
              duration: 10000,
              description: (
                <div className="mt-2 text-sm">
                  <p>Simpan detail login Anda:</p>
                  <div className="bg-slate-100 p-2 rounded mt-1 font-mono text-xs">
                    <p>Username: <strong>{response.user.username}</strong></p>
                    <p>Password: <strong>{response.user.tempPassword}</strong></p>
                    <p className="text-muted-foreground mt-1 italic">Password sementara, harap segera diganti.</p>
                  </div>
                </div>
              )
            });
          } else {
            toast.success('Akun berhasil dibuat!');
          }
        }

        const sessionId = response.id;

        toast.success('Sesi konsultasi dibuat!');
        // Delay navigation slightly so user sees the modal/toast
        setTimeout(() => {
          navigate(`/patient/consultation/payment/${sessionId}`);
        }, 3000);
      } catch (error: any) {
        if (error.response?.status === 409) {
          toast.error('Email sudah terdaftar!', {
            description: (
              <div className="mt-2 text-sm flex flex-col gap-2">
                <p>Silakan masuk menggunakan akun yang sudah ada.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/patient/login')}
                  className="bg-white text-primary border-primary hover:bg-primary/10 w-fit"
                >
                  Masuk Sekarang
                </Button>
              </div>
            ),
            duration: 8000
          });
        } else {
          toast.error(error.response?.data?.message || 'Gagal memulai sesi chat. Silakan coba lagi.');
        }
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    toast.success('Permintaan konsultasi berhasil dikirim!', {
      description: 'Dokter akan menghubungi Anda dalam 5 menit.',
    });
    setStep(3);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              💬 Telemedicine
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Konsultasi Online</h1>
            <p className="text-lg text-white/80">
              Konsultasi dengan dokter dari mana saja. Cepat, aman, dan nyaman.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Clock, text: 'Respons Cepat 5 Menit' },
              { icon: Shield, text: 'Data Aman & Rahasia' },
              { icon: Stethoscope, text: '100+ Dokter Spesialis' },
              { icon: CheckCircle, text: 'Resep Digital' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!isConsultationEnabled ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="card-medical p-12">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Layanan Tidak Tersedia</h2>
                <p className="text-muted-foreground mb-8">
                  Mohon maaf, layanan konsultasi online sedang tidak tersedia saat ini.
                  Silakan hubungi kami melalui telepon atau kunjungi rumah sakit untuk konsultasi langsung.
                </p>
                <Button
                  variant="medical"
                  onClick={() => window.location.href = '/contact'}
                >
                  Hubungi Kami
                </Button>
              </div>
            </motion.div>
          ) : step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Pilih Jenis Konsultasi</h2>
                <p className="text-muted-foreground">Pilih metode konsultasi yang paling nyaman untuk Anda</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {consultationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        setSelectedType(type.id);
                        setStep(2);
                      }}
                      className={`relative cursor-pointer card-medical p-6 border-2 transition-all ${selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-primary/50'
                        }`}
                    >
                      {type.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-white text-xs font-medium rounded-full">
                          Populer
                        </span>
                      )}
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">{type.price}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {type.duration}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {type.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-secondary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="mb-6"
              >
                ← Kembali
              </Button>

              <div className="card-medical p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Lengkapi Data</h2>
                    <p className="text-sm text-muted-foreground">Isi data untuk memulai konsultasi</p>
                  </div>
                </div>

                {localStorage.getItem('token') ? (
                  // Logged In View
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Masuk sebagai {JSON.parse(localStorage.getItem('user') || '{}').name}</h4>
                      <p className="text-sm text-green-700">Data diri Anda akan diambil dari profil akun.</p>
                    </div>
                  </div>
                ) : (
                  // Guest View - Login Prompt
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Sudah punya akun Pasien?</h4>
                        <p className="text-sm text-blue-700">Silakan masuk untuk menggunakan data yang tersimpan.</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                      onClick={() => navigate('/patient/login')}
                    >
                      Masuk Sekarang
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!localStorage.getItem('token') && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input id="name" placeholder="Nama Anda" className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="email@contoh.com" className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Nomor Telepon *</Label>
                        <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="nik">NIK (16 Digit) *</Label>
                        <Input id="nik" type="text" placeholder="16 digit NIK sesuai KTP" className="mt-1" required minLength={16} maxLength={16} />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Tanggal Lahir *</Label>
                        <Input id="dateOfBirth" type="date" className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="gender">Jenis Kelamin *</Label>
                        <Select required onValueChange={(val) => (document.getElementById('gender') as HTMLInputElement).value = val}>
                          <SelectTrigger id="gender-trigger" className="mt-1">
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Laki-laki</SelectItem>
                            <SelectItem value="FEMALE">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Hidden input to capture value for handleSubmit */}
                        <input type="hidden" id="gender" />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="doctor">Pilih Dokter *</Label>
                    <Select required value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih dokter untuk konsultasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors?.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complaint">Keluhan *</Label>
                    <Textarea
                      id="complaint"
                      placeholder="Jelaskan keluhan Anda secara singkat..."
                      className="mt-1 min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" variant="medical" size="lg" className="w-full gap-2">
                      Mulai Konsultasi
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Permintaan Diterima!</h2>
              <p className="text-muted-foreground mb-8">
                Dokter akan menghubungi Anda dalam 5 menit.
                Pastikan telepon Anda aktif dan dalam jangkauan.
              </p>
              <div className="space-y-3">
                <Button
                  variant="medical"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Konsultasi Lagi
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Resume Session Dialog */}
      <AlertDialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lanjutkan Sesi Konsultasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki sesi konsultasi dengan <strong>{resumeDoctorName}</strong> yang belum dibayar.
              Apakah Anda ingin melanjutkan pembayaran?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nanti Saja</AlertDialogCancel>
            <AlertDialogAction onClick={handleResume} className="bg-teal-600 hover:bg-teal-700">
              Lanjutkan Pembayaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ConsultationPage;
