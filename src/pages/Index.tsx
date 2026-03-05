import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Calendar,
  MessageCircle,
  ChevronRight,
  Stethoscope,
  Building2,
  AlertCircle,
  Activity,
  FlaskConical,
  Users,
  Award,
  Clock,
  Heart,
  Phone,
  ArrowRight,
  CheckCircle,
  Star,
  LucideIcon,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import HeroCarousel from '@/components/home/HeroCarousel';
import NewsCarousel from '@/components/home/NewsCarousel';
import GoogleReviews from '@/components/home/GoogleReviews';

// Icon mapping helper
const iconMap: Record<string, LucideIcon> = {
  'Stethoscope': Stethoscope,
  'Building2': Building2,
  'AlertCircle': AlertCircle,
  'Activity': Activity,
  'FlaskConical': FlaskConical,
  'Heart': Heart,
  'Users': Users,
  'Award': Award,
  'Star': Star,
  // Add defaults/others
};

import { useSettings } from '@/hooks/useSettings';
import { useToast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAppointmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/patient/dashboard');
    } else {
      navigate('/appointment');
    }
  };

  // Fetch Services (Public)
  const { data: servicesData } = useQuery({
    queryKey: ['public-services', 'featured'],
    queryFn: () => api.services.getAllPublic('isFeatured=true'),
  });

  // Fetch Doctors (Public - Limit 4)
  const { data: doctorsData } = useQuery({
    queryKey: ['public-doctors-home'],
    queryFn: () => api.doctors.getAllPublic('limit=4&isAvailable=true'),
  });

  const backendServices = servicesData || [];
  const backendDoctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.data || []);

  // Correction: api.ts fetcher returns data.data if successResponse structure is { data, ... }. 
  // Let's verify response.js: paginatedResponse returns { data: [...], pagination: {...} }.
  // So api.ts fetcher returning "data.data" might mean it returns the payload { data: [...], pagination: ... } ?
  // My api.ts: `return data.data;`. If backend sends { success: true, data: [..] }, then it returns [..].
  // If backend sends { success: true, data: [..], pagination: .. }, does it return [..] or the object?
  // paginatedResponse in response.js: `res.json({ success: true, message, data, pagination })`.
  // So `data.data` from fetcher is the ARRAY of items. Pagination metadata is lost in strictly `data.data` return if not careful.
  // Wait, `response.json()` result is the full object. `data.data` accesses the `data` property of `response.json()`.
  // So yes, `backendDoctors` should be the array.

  // Transform Services
  // If backend services are empty (e.g. not seeded enough), fallback to hardcoded or show empty?
  // Seeded data has 3 services.

  const services = backendServices.length > 0 ? backendServices.map((svc: any) => ({
    icon: iconMap[svc.icon as string] || Stethoscope,
    title: svc.name,
    description: svc.description,
    path: `/services/${svc.slug}`,
    // Gradient colors need mapping or simplified. Let's cycle or map based on type.
    color: svc.type === 'EMERGENCY' ? 'from-destructive to-destructive/80' :
      svc.type === 'INPATIENT' ? 'from-secondary to-secondary-light' :
        'from-primary to-primary-light'
  })) : [
    // Fallback if no data
    {
      icon: Stethoscope,
      title: t('services.outpatient.title'),
      description: t('services.outpatient.description'),
      path: '/services/rawat-jalan',
      color: 'from-primary to-primary-light'
    },
    // ... could add others but let's trust the seed
  ];

  const doctors = backendDoctors.length > 0 ? backendDoctors.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    specialty: doc.specialization,
    image: doc.photoUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    experienceYears: doc.experienceYears,
    rating: doc.rating,
    isAvailable: doc.isAvailable,
  })) : [];

  const stats = [
    { value: settings?.profile_settings?.stats?.patients || '50,000+', label: t('stats.patients'), icon: Users },
    { value: settings?.profile_settings?.stats?.doctors || '120+', label: t('stats.doctors'), icon: Stethoscope },
    { value: settings?.profile_settings?.stats?.experience || '25+', label: t('stats.experience'), icon: Award },
    { value: settings?.profile_settings?.stats?.satisfaction || '98%', label: t('stats.satisfaction'), icon: Star },
  ];

  const features = settings?.profile_settings?.aboutFeatures?.length ? settings.profile_settings.aboutFeatures : [
    'Tenaga medis profesional dan bersertifikasi',
    'Peralatan medis modern dan terkini',
    'Pelayanan 24 jam untuk gawat darurat',
    'Sistem rekam medis terintegrasi',
    'Fasilitas rawat inap yang nyaman',
    'Program kesehatan preventif',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Quick Actions */}
      <section className="relative -mt-8 sm:-mt-16 z-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl shadow-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {/* e-Health */}
          <a
            href="https://ehealth.surabaya.go.id/pendaftaranv2/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0">
              <Globe className="w-6 h-6 text-green-600 group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">e-Health</h3>
              <p className="text-xs text-muted-foreground truncate">Pendaftaran Online</p>
            </div>
          </a>

          {/* JKN Mobile */}
          <a
            href="https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <Smartphone className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">JKN Mobile</h3>
              <p className="text-xs text-muted-foreground truncate">Download Aplikasi</p>
            </div>
          </a>

          {/* Internal Appointment */}
          <div onClick={handleAppointmentClick} className="cursor-pointer group flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <Calendar className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">Janji Temu</h3>
              <p className="text-xs text-muted-foreground truncate">Umum / Asuransi</p>
            </div>
          </div>

          {/* Consultation */}
          <Link to="/consultation" className="group flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/5 transition-colors border border-transparent hover:border-secondary/10">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
              <MessageCircle className="w-6 h-6 text-secondary group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">Konsultasi</h3>
              <p className="text-xs text-muted-foreground truncate">Telemedicine</p>
            </div>
          </Link>

          {/* Emergency */}
          <Link to="/services/gawat-darurat" className="group flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/5 transition-colors border border-transparent hover:border-destructive/10">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-colors shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">Gawat Darurat</h3>
              <p className="text-xs text-muted-foreground truncate">{settings?.operatingHours || 'Layanan 24 Jam'}</p>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Medical Tourism Highlight */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-teal-900 to-teal-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2 p-10 md:p-16 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                  <Globe className="w-4 h-4" /> Layanan Eksklusif
                </span>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.2]">
                  Mulai Perjalanan<br />
                  <span className="text-teal-400">Wisata Medis</span> Anda
                </h2>

                <p className="text-teal-50 mb-8 max-w-lg leading-relaxed text-lg">
                  Kombinasi layanan kesehatan berkualitas internasional dan kenyamanan berwisata di Surabaya, khusus dirancang untuk pasien luar kota dan mancanegara.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/wisata-medis">
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                      Lihat Paket & Fasilitas
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-1/2 relative h-64 lg:h-auto min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-transparent z-10 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-800 to-transparent z-10 lg:hidden" />
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"
                  alt="Medical Tourism RS Soewandhie"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Layanan Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark mb-4">
              {t('services.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('services.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="h-full">
                  <Link to={service.path} className="block h-full">
                    <div className="relative group h-full bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                      {/* Background Decoration */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity`} />

                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>

                        <p className="text-gray-500 mb-6 leading-relaxed line-clamp-3">
                          {service.description}
                        </p>

                        <div className="flex items-center text-primary font-semibold group/btn">
                          <span className="mr-2 border-b-2 border-transparent group-hover/btn:border-primary transition-all">
                            {t('common.learnMore')}
                          </span>
                          <div className="bg-primary/10 rounded-full p-1 group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Tentang Kami
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Mengapa Memilih
                <br />
                <span className="text-primary">{settings?.name || "RS Harapan Sehat"}?</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {settings?.profile_settings?.about || `Selama bertahun-tahun, ${settings?.name || "RS Soewandhie"} telah menjadi pilihan utama masyarakat dalam mendapatkan pelayanan kesehatan berkualitas. Dengan tenaga medis profesional dan fasilitas modern, kami berkomitmen untuk memberikan pelayanan terbaik.`}
              </p>

              <div className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/profile">
                <Button variant="medical" size="lg" className="gap-2">
                  Selengkapnya Tentang Kami
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={settings?.profile_settings?.aboutImages?.[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop"}
                      alt="Hospital Building"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={settings?.profile_settings?.aboutImages?.[1] || "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop"}
                      alt="Medical Equipment"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={settings?.profile_settings?.aboutImages?.[2] || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop"}
                      alt="Medical Team"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={settings?.profile_settings?.aboutImages?.[3] || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop"}
                      alt="Patient Care"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="absolute -bottom-6 -left-6 bg-primary text-white rounded-2xl p-6 shadow-xl"
              >
                <div className="text-4xl font-bold">{settings?.profile_settings?.stats?.experience || "25+"}</div>
                <div className="text-sm text-white/80">Tahun Pengalaman</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-24 md:py-40 bg-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Expert Medical Team
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">
              Tim Dokter <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Terbaik</span> Kami
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
              Dedikasi penuh untuk kesehatan Anda dengan standar layanan internasional dan sentuhan kemanusiaan.
            </p>
          </motion.div>

          {doctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {doctors.map((doctor, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.8, ease: "circOut" }}
                  className="group relative"
                >
                  {/* Glowing Orb Background */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative bg-white rounded-[2.8rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] group-hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-[560px] border border-slate-100/50">
                    {/* Image Canvas */}
                    <div className="relative h-[62%] overflow-hidden bg-slate-50">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover object-top filter group-hover:brightness-110 transition-all duration-1000 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

                      {/* Floating Rating Badge - Signature Style */}
                      {doctor.rating > 0 && (
                        <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-black text-white">{Number(doctor.rating).toFixed(1)}</span>
                        </div>
                      )}

                      {/* Available Status */}
                      {doctor.isAvailable ? (
                        <div className="absolute top-6 left-6 bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">Online</span>
                        </div>
                      ) : (
                        <div className="absolute top-6 left-6 bg-slate-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">Sibuk</span>
                        </div>
                      )}
                    </div>

                    {/* Sophisticated Content Area */}
                    <div className="p-8 flex flex-col flex-grow bg-white relative">
                      <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="h-[2px] w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                          <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">{doctor.specialty}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2">
                          {doctor.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 py-6 border-t border-slate-50 mt-4">
                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">Pengalaman Medis</p>
                          <p className="text-sm font-black text-slate-800">
                            {doctor.experienceYears || '0'}+ Tahun Dedikasi
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleAppointmentClick}
                        className="group/btn relative w-full rounded-2xl h-16 bg-slate-900 border-none overflow-hidden transition-all duration-500 shadow-xl shadow-slate-900/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-white text-base font-black tracking-wide">
                          Buat Janji Temu
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-500" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic tracking-wider">Sedang memuat data tim ahli...</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link to="/profile/doctors">
              <button className="px-10 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-900 font-black text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-500 shadow-xl hover:shadow-primary/20">
                Lihat Seluruh Spesialis
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Google Reviews */}
      {
        settings?.external_links?.googleReviews?.enabled && (
          <GoogleReviews placeId={settings?.external_links?.googleReviews?.placeId} />
        )
      }

      {/* NewsCarousel */}
      <NewsCarousel />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-dark via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Butuh Bantuan Kesehatan?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Tim medis profesional kami siap melayani Anda 24/7.
              Hubungi kami atau buat janji temu sekarang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div onClick={handleAppointmentClick} className="cursor-pointer">
                <Button variant="hero" size="xl" className="gap-2">
                  <Calendar className="w-5 h-5" />
                  Buat Janji Temu
                </Button>
              </div>
              <a href={`tel:${(settings?.phone || '0313717141').replace(/[^0-9]/g, '')}`}>
                <Button variant="heroOutline" size="xl" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Hubungi {settings?.phone || '(031) 3717141'}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout >
  );
};

export default Index;
