import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Index: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // Fetch Services (Public)
  const { data: servicesData } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.services.getAllPublic(),
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
      path: '/services/outpatient',
      color: 'from-primary to-primary-light'
    },
    // ... could add others but let's trust the seed
  ];

  const doctors = backendDoctors.length > 0 ? backendDoctors.map((doc: any) => ({
    name: doc.name,
    specialty: doc.specialization,
    image: doc.photoUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300'
  })) : [
    // Fallback
    { name: 'Dr. Ahmad Wijaya, Sp.JP', specialty: 'Spesialis Jantung', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300' },
  ];

  const stats = [
    { value: '50,000+', label: t('stats.patients'), icon: Users },
    { value: '120+', label: t('stats.doctors'), icon: Stethoscope },
    { value: '25+', label: t('stats.experience'), icon: Award },
    { value: '98%', label: t('stats.satisfaction'), icon: Star },
  ];

  const features = [
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
          <Link to="/appointment" className="group flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <Calendar className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">Janji Temu</h3>
              <p className="text-xs text-muted-foreground truncate">Umum / Asuransi</p>
            </div>
          </Link>

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
          <Link to="/services/emergency" className="group flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/5 transition-colors border border-transparent hover:border-destructive/10">
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

      {/* Services Section */}
      <section className="py-12 md:py-24 bg-muted/30">
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
            <h2 className="section-heading mb-4">{t('services.title')}</h2>
            <p className="section-subheading mx-auto">{t('services.subtitle')}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Link to={service.path}>
                    <div className="service-card group h-full">
                      <div className={`service-card-icon bg-gradient-to-br ${service.color} mb-5`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                        {t('common.learnMore')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
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
                {settings?.profile_settings?.about || "Selama lebih dari 25 tahun, RS Harapan Sehat telah menjadi pilihan utama masyarakat dalam mendapatkan pelayanan kesehatan berkualitas. Dengan tenaga medis profesional dan fasilitas modern, kami berkomitmen untuk memberikan pelayanan terbaik."}
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
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop"
                      alt="Hospital Building"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop"
                      alt="Medical Equipment"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop"
                      alt="Medical Team"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop"
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
                <div className="text-4xl font-bold">25+</div>
                <div className="text-sm text-white/80">Tahun Pengalaman</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Tim Dokter
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{t('doctors.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('doctors.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold">{doctor.name}</h3>
                      <p className="text-sm text-white/80">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                    <Link to="/appointment">
                      <Button variant="outline" size="sm">
                        Buat Janji
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/profile/doctors">
              <Button variant="outline" size="lg" className="gap-2">
                Lihat Semua Dokter
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* News Carousel */}
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
              <Link to="/appointment">
                <Button variant="hero" size="xl" className="gap-2">
                  <Calendar className="w-5 h-5" />
                  Buat Janji Temu
                </Button>
              </Link>
              <a href="tel:02112345678">
                <Button variant="heroOutline" size="xl" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Hubungi (021) 1234-5678
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
