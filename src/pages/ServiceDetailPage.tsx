import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DEFAULT_SERVICE_PAGES } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Building2,
  AlertCircle,
  Activity,
  FlaskConical,
  Heart,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Users,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useSettings } from '@/hooks/useSettings';

const ServiceDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { settings, isLoading } = useSettings();

  // Helper to resolve icon component from string name
  const getIcon = (iconName?: string) => {
    const icons: Record<string, any> = {
      Stethoscope,
      Building2,
      AlertCircle,
      Activity,
      FlaskConical,
      Heart
    };
    return icons[iconName || 'Stethoscope'] || Stethoscope;
  };

  const service = useMemo(() => {
    if (!type) return null;

    // Map Indonesian slugs to internal keys
    const slugMap: Record<string, string> = {
      'rawat-jalan': 'outpatient',
      'rawat-inap': 'inpatient',
      'gawat-darurat': 'emergency',
      'perawatan-intensif': 'intensive',
      'penunjang-medis': 'supporting',
      'klinik-spesialis': 'specialist',
      // Keep English slugs for compatibility
      'outpatient': 'outpatient',
      'inpatient': 'inpatient',
      'emergency': 'emergency',
      'intensive': 'intensive',
      'supporting': 'supporting',
      'specialist': 'specialist'
    };

    const key = slugMap[type] || type;
    // Use settings data if available, otherwise fall back to DEFAULT_SERVICE_PAGES
    return (
      settings?.service_pages?.[key as keyof typeof settings.service_pages] ||
      DEFAULT_SERVICE_PAGES[key] ||
      null
    );
  }, [settings, type]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">Loading...</div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Layanan Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">Maaf, layanan yang Anda cari tidak tersedia.</p>
          <Link to="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const Icon = getIcon(service.icon);

  return (
    <Layout>
      {/* Hero Section */}
      <section className={`relative py-20 overflow-hidden bg-gradient-to-r ${service.color || 'from-primary to-primary-light'}`}>
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="md:w-1/2 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  Layanan Unggulan
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.title}</h1>
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" className="group">
                  Buat Janji Temu
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Hubungi Kami
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-video transform hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden md:block">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jam Operasional</p>
                      <p className="font-bold text-gray-900">24 Jam</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tim Medis</p>
                      <p className="font-bold text-gray-900">Profesional & Ahli</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                Tentang Layanan
              </h2>
              <div className="text-lg text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                {service.fullDescription}
              </div>

              {/* Features Grid */}
              <h3 className="text-2xl font-bold mb-6 mt-12">Keunggulan Layanan</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {service.features?.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-gray-800">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Procedures/Flow */}
              <h3 className="text-2xl font-bold mb-6">Alur Pelayanan</h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-8">
                  {service.procedures?.map((procedure, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-center gap-8 group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center font-bold text-xl text-primary shadow-lg z-10 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1 p-6 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-lg">{procedure}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:w-1/3 space-y-8">
              {/* Facilities */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Fasilitas Tersedia
                </h3>
                <ul className="space-y-4">
                  {service.facilities?.map((facility, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctors Preview */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Dokter Spesialis
                </h3>
                <div className="space-y-6">
                  {service.doctors?.map((doctor, index) => (
                    <div key={index} className="flex items-start gap-4 pb-6 border-b last:border-0 last:pb-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <Users className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                        <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {doctor.schedule}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/profile/doctors">
                  <Button variant="outline" className="w-full mt-6">
                    Lihat Semua Jadwal
                  </Button>
                </Link>
              </div>

              {/* Contact Card */}
              <div className="bg-primary text-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-4">Butuh Bantuan?</h3>
                <p className="mb-6 opacity-90">
                  Tim kami siap membantu Anda 24/7 untuk informasi lebih lanjut.
                </p>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Call Center
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceDetailPage;
