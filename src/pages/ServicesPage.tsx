import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  AlertCircle,
  Activity,
  FlaskConical,
  Heart,
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Stethoscope,
      title: t('services.outpatient.title'),
      description: t('services.outpatient.description'),
      path: '/services/rawat-jalan',
      color: 'from-primary to-primary-light',
      features: [
        'Konsultasi dengan dokter spesialis',
        'Pemeriksaan kesehatan lengkap',
        'Layanan farmasi terintegrasi',
        'Sistem antrian online'
      ]
    },
    {
      icon: Building2,
      title: t('services.inpatient.title'),
      description: t('services.inpatient.description'),
      path: '/services/rawat-inap',
      color: 'from-secondary to-secondary-light',
      features: [
        'Kamar VIP, Kelas 1, 2, dan 3',
        'Perawatan 24 jam',
        'Menu nutrisi khusus',
        'Fasilitas keluarga pasien'
      ]
    },
    {
      icon: AlertCircle,
      title: t('services.emergency.title'),
      description: t('services.emergency.description'),
      path: '/services/gawat-darurat',
      color: 'from-destructive to-destructive/80',
      features: [
        'Layanan 24 jam non-stop',
        'Tim medis terlatih',
        'Ambulans siaga',
        'Triase cepat dan tepat'
      ]
    },
    {
      icon: Activity,
      title: t('services.intensive.title'),
      description: t('services.intensive.description'),
      path: '/services/perawatan-intensif',
      color: 'from-primary-dark to-primary',
      features: [
        'ICU (Intensive Care Unit)',
        'ICCU (Cardiac Care)',
        'NICU (Neonatal)',
        'PICU (Pediatric)'
      ]
    },
    {
      icon: FlaskConical,
      title: t('services.supporting.title'),
      description: t('services.supporting.description'),
      path: '/services/penunjang-medis',
      color: 'from-secondary to-primary',
      features: [
        'Laboratorium lengkap',
        'Radiologi & CT Scan',
        'Farmasi 24 jam',
        'Rehabilitasi medik'
      ]
    },
    {
      icon: Heart,
      title: t('services.specialist.title'),
      description: t('services.specialist.description'),
      path: '/services/klinik-spesialis',
      color: 'from-accent to-accent/80',
      features: [
        '20+ klinik spesialis',
        'Dokter berpengalaman',
        'Jadwal praktik fleksibel',
        'Booking online'
      ]
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
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              Layanan Kesehatan Komprehensif
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('services.title')}</h1>
            <p className="text-lg text-white/80">{t('services.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground">Klinik Spesialis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">120+</div>
              <div className="text-sm text-muted-foreground">Dokter Ahli</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Layanan IGD</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Tempat Tidur</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="card-medical h-full p-8 group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-secondary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={service.path}>
                      <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        Selengkapnya
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Butuh Konsultasi?
            </h2>
            <p className="text-muted-foreground mb-6">
              Hubungi kami atau buat janji temu untuk mendapatkan pelayanan kesehatan terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/appointment">
                <Button variant="medical" size="lg" className="gap-2">
                  Buat Janji Temu
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:02112345678">
                <Button variant="outline" size="lg">
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

export default ServicesPage;
