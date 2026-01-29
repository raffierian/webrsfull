import React, { useState } from 'react';
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
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';

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

const specialists = [
  { id: 'general', name: 'Dokter Umum' },
  { id: 'internist', name: 'Spesialis Penyakit Dalam' },
  { id: 'cardiology', name: 'Spesialis Jantung' },
  { id: 'pediatric', name: 'Spesialis Anak' },
  { id: 'obgyn', name: 'Spesialis Kebidanan' },
  { id: 'dermatology', name: 'Spesialis Kulit' },
  { id: 'neurology', name: 'Spesialis Saraf' },
  { id: 'psychiatry', name: 'Spesialis Jiwa' },
];

const ConsultationPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [step, setStep] = useState(1);

  // Fetch settings to check if consultation is enabled
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.getAll(),
  });

  const isConsultationEnabled = settings?.consultationEnabled ?? settings?.external_links?.consultationEnabled ?? true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input id="name" placeholder="Nama Anda" className="mt-1" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" className="mt-1" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialist">Pilih Spesialis *</Label>
                    <Select required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih dokter spesialis" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialists.map((spec) => (
                          <SelectItem key={spec.id} value={spec.id}>
                            {spec.name}
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
    </Layout>
  );
};

export default ConsultationPage;
