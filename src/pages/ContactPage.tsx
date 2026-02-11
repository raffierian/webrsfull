import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Ambulance,
  Building,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

import { useSettings } from '@/hooks/useSettings';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('submit');

  const mutation = useMutation({
    mutationFn: (data: any) => api.complaints.create(data),
    onSuccess: (complaint) => {
      const ticketNumber = `TKT-${new Date().getFullYear()}-${complaint.id.slice(0, 4).toUpperCase()}`;
      setSubmittedTicket(ticketNumber);
      localStorage.setItem(`complaint_${complaint.id}`, ticketNumber);

      toast.success('Pesan berhasil dikirim!', {
        description: `Nomor tiket Anda: ${ticketNumber}`,
      });
      (document.getElementById('contact-form') as HTMLFormElement)?.reset();
    },
    onError: (error: any) => {
      toast.error('Gagal mengirim pesan', {
        description: error.message || 'Silakan coba lagi nanti.',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      category: 'GENERAL' // Default category
    };
    mutation.mutate(data);
  };

  const handleTrack = async () => {
    if (!trackingNumber) {
      toast.error('Masukkan nomor tiket');
      return;
    }

    try {
      const parts = trackingNumber.split('-');
      if (parts.length !== 3 || !parts[0].startsWith('TKT')) {
        throw new Error('Format nomor tiket tidak valid');
      }

      let complaintId = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('complaint_')) {
          const storedTicket = localStorage.getItem(key);
          if (storedTicket === trackingNumber) {
            complaintId = key.replace('complaint_', '');
            break;
          }
        }
      }

      if (!complaintId) {
        throw new Error('Nomor tiket tidak ditemukan');
      }

      const complaint = await api.complaints.trackById(complaintId);
      setTrackedComplaint(complaint);
    } catch (error: any) {
      toast.error(error.message || 'Nomor tiket tidak valid');
      setTrackedComplaint(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    const config: any = {
      NEW: { color: 'text-yellow-600', icon: Clock, label: 'Baru' },
      PENDING: { color: 'text-yellow-600', icon: Clock, label: 'Menunggu' },
      IN_PROGRESS: { color: 'text-blue-600', icon: AlertCircle, label: 'Diproses' },
      RESOLVED: { color: 'text-green-600', icon: CheckCircle, label: 'Selesai' },
    };
    const { color, icon: Icon, label } = config[status] || config.NEW;
    return (
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telepon',
      details: [
        { label: 'Pendaftaran', value: settings?.phone || '(031) 3717141' },
        { label: 'IGD', value: settings?.emergencyPhone || '(031) 37309595' },
        { label: 'Ambulans & Command Center', value: '112' },
      ],
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        { label: 'Informasi', value: settings?.email || 'info@rs-soewandhie.com' },
        { label: 'Pendaftaran', value: settings?.admissionEmail || 'pendaftaran@rs-soewandhie.com' },
        { label: 'Karir', value: settings?.careerEmail || 'hrd@rs-soewandhie.com' },
      ],
      color: 'bg-secondary/10 text-secondary'
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      details: [
        { label: 'IGD & Gawat Darurat', value: '24 Jam (Setiap Hari)' },
        { label: 'Poliklinik', value: settings?.operatingHours || '07:30 - 14:00' },
      ],
      color: 'bg-accent/10 text-accent'
    },
    {
      icon: MapPin,
      title: 'Alamat',
      details: [
        { label: '', value: settings?.address || 'Jl. Tambak Rejo No.45-47, Simokerto, Surabaya' },
      ],
      color: 'bg-destructive/10 text-destructive'
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('contact.title')}</h1>
            <p className="text-lg text-white/80">
              Kami siap membantu Anda. Hubungi kami melalui telepon, email, atau kunjungi langsung.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card-medical p-6"
                >
                  <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-4">{info.title}</h3>
                  <div className="space-y-2">
                    {info.details.map((detail, dIdx) => (
                      <div key={dIdx} className="text-sm">
                        {detail.label && (
                          <span className="text-muted-foreground">{detail.label}: </span>
                        )}
                        <span className="font-medium">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form with Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="submit" className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Kirim Pesan
                  </TabsTrigger>
                  <TabsTrigger value="track" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Lacak Pengaduan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="submit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Form Pengaduan
                      </CardTitle>
                      <CardDescription>
                        Isi formulir di bawah ini dengan lengkap dan jelas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {submittedTicket ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Pengaduan Berhasil Dikirim!</h3>
                          <p className="text-muted-foreground mb-4">
                            Simpan nomor tiket berikut untuk melacak status pengaduan Anda
                          </p>
                          <div className="bg-primary/10 rounded-lg p-4 inline-block">
                            <p className="text-2xl font-mono font-bold text-primary">{submittedTicket}</p>
                          </div>
                          <div className="mt-6 space-y-2">
                            <Button variant="outline" onClick={() => setSubmittedTicket(null)}>
                              Kirim Pengaduan Lain
                            </Button>
                            <Button variant="default" onClick={() => setActiveTab('track')}>
                              Lacak Pengaduan Ini
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Nama Lengkap *</Label>
                              <Input id="name" name="name" placeholder="Nama Anda" className="mt-1" required />
                            </div>
                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input id="email" name="email" type="email" placeholder="email@example.com" className="mt-1" required />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="subject">Subjek *</Label>
                            <Input id="subject" name="subject" placeholder="Perihal pesan" className="mt-1" required />
                          </div>
                          <div>
                            <Label htmlFor="message">Pesan *</Label>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Tulis pesan Anda..."
                              className="mt-1 min-h-[120px]"
                              required
                            />
                          </div>
                          <Button type="submit" variant="medical" size="lg" className="w-full gap-2" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Mengirim...' : <><Send className="w-5 h-5" /> Kirim Pesan</>}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="track">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Lacak Status Pengaduan
                      </CardTitle>
                      <CardDescription>
                        Masukkan nomor tiket untuk melihat status pengaduan Anda
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-6">
                        <Input
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                          placeholder="Contoh: TKT-2026-A1B2"
                          className="flex-1"
                        />
                        <Button onClick={handleTrack}>Lacak</Button>
                      </div>

                      {trackedComplaint && (
                        <div className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-lg font-semibold text-primary">
                              {trackedComplaint.ticketNumber}
                            </span>
                            {getStatusDisplay(trackedComplaint.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Subjek</p>
                              <p className="font-medium">{trackedComplaint.subject}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tanggal Pengaduan</p>
                              <p className="font-medium">
                                {new Date(trackedComplaint.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          {trackedComplaint.response && (
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Respons</p>
                              <p>{trackedComplaint.response}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="card-medical p-4 h-80">
                <iframe
                  src={settings?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.886369062334!2d112.75338331477484!3d-7.253776994763435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f975765c3fd3%3A0xc6657685970c64c7!2sRSUD%20Dr.%20Mohamad%20Soewandhie!5e0!3m2!1sen!2sid!4v1645498263123!5m2!1sen!2sid"}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '0.75rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi RS Harapan Sehat"
                />
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-medical p-4 flex items-center gap-3 hover:border-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Chat langsung</div>
                  </div>
                </a>

                <a
                  href="tel:119"
                  className="card-medical p-4 flex items-center gap-3 hover:border-destructive transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Ambulance className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Ambulans</div>
                    <div className="text-xs text-muted-foreground">Darurat 119</div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
