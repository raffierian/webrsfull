import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Calendar,
  Users,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

import { useSettings } from '@/hooks/useSettings';

const ServiceDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { settings } = useSettings();
  const hospitalName = settings?.name || "RS Harapan Sehat";

  const servicesData: Record<string, {
    icon: any;
    title: string;
    description: string;
    fullDescription: string;
    color: string;
    image: string;
    features: string[];
    doctors: { name: string; specialty: string; schedule: string }[];
    facilities: string[];
    procedures: string[];
  }> = {
    outpatient: {
      icon: Stethoscope,
      title: 'Rawat Jalan',
      description: 'Layanan konsultasi dan pemeriksaan kesehatan tanpa rawat inap',
      fullDescription: `Layanan rawat jalan ${hospitalName} menyediakan konsultasi dengan dokter spesialis dan pemeriksaan kesehatan lengkap. Dengan sistem antrian online dan pelayanan yang efisien, Anda dapat berkonsultasi dengan dokter pilihan tanpa harus menunggu lama.`,
      color: 'from-primary to-primary-light',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=500&fit=crop',
      features: [
        'Konsultasi dengan 20+ dokter spesialis',
        'Sistem pendaftaran online',
        'Antrian digital real-time',
        'Hasil pemeriksaan hari yang sama',
        'Farmasi terintegrasi',
        'Pembayaran cashless'
      ],
      doctors: [
        { name: 'Dr. Andi Prasetyo', specialty: 'Dokter Umum', schedule: 'Senin - Jumat, 08:00 - 14:00' },
        { name: 'Dr. Linda Susanti', specialty: 'Dokter Umum', schedule: 'Senin - Jumat, 14:00 - 20:00' },
        { name: 'Dr. Ahmad Wijaya, Sp.JP', specialty: 'Kardiologi', schedule: 'Senin, Rabu, Jumat, 09:00 - 14:00' },
      ],
      facilities: ['Ruang tunggu nyaman ber-AC', 'Area parkir luas', 'Kantin', 'Mushola', 'ATM Center'],
      procedures: ['Pendaftaran', 'Pemeriksaan Tanda Vital', 'Konsultasi Dokter', 'Pemeriksaan Penunjang', 'Pengambilan Obat'],
    },
    inpatient: {
      icon: Building2,
      title: 'Rawat Inap',
      description: 'Fasilitas perawatan menginap dengan berbagai kelas kamar',
      fullDescription: 'Fasilitas rawat inap kami menyediakan berbagai pilihan kelas kamar mulai dari VIP hingga kelas 3. Setiap kamar dilengkapi dengan fasilitas modern dan perawatan 24 jam oleh tenaga medis profesional.',
      color: 'from-secondary to-secondary-light',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop',
      features: [
        'Kamar VIP, Kelas 1, 2, dan 3',
        'Perawatan 24 jam oleh perawat profesional',
        'Menu nutrisi khusus dari ahli gizi',
        'Fasilitas untuk keluarga pasien',
        'TV, AC, dan WiFi di setiap kamar',
        'Tombol panggil perawat'
      ],
      doctors: [
        { name: 'Dr. Ratna Sari, Sp.PD', specialty: 'Penyakit Dalam', schedule: 'Visite harian' },
        { name: 'Dr. Budi Santoso, Sp.B', specialty: 'Bedah Umum', schedule: 'Visite harian' },
      ],
      facilities: ['Kamar mandi dalam', 'TV LED', 'AC', 'WiFi gratis', 'Sofa bed untuk penunggu'],
      procedures: ['Admisi', 'Perawatan Harian', 'Visite Dokter', 'Pemeriksaan Berkala', 'Discharge Planning'],
    },
    emergency: {
      icon: AlertCircle,
      title: 'Instalasi Gawat Darurat',
      description: 'Layanan darurat 24 jam dengan respon cepat',
      fullDescription: `Unit Gawat Darurat (UGD) ${hospitalName} beroperasi 24 jam dengan tim medis terlatih dan peralatan lengkap untuk menangani berbagai kondisi darurat. Sistem triase memastikan pasien ditangani sesuai tingkat kegawatdaruratan.`,
      color: 'from-destructive to-destructive/80',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
      features: [
        'Layanan 24 jam non-stop',
        'Tim medis terlatih ACLS/ATLS',
        'Ambulans siaga dengan peralatan lengkap',
        'Sistem triase 5 level',
        'Resusitasi dan stabilisasi',
        'Akses langsung ke OK dan ICU'
      ],
      doctors: [
        { name: 'Dr. Emergency Team', specialty: 'Tim Jaga IGD', schedule: '24 Jam' },
      ],
      facilities: ['Ruang resusitasi', 'Ruang tindakan', 'Ruang observasi', 'Ambulans 3 unit', 'Helipad'],
      procedures: ['Triase', 'Stabilisasi', 'Pemeriksaan Awal', 'Penanganan Darurat', 'Transfer/Rawat Inap'],
    },
    intensive: {
      icon: Activity,
      title: 'Perawatan Intensif',
      description: 'ICU, ICCU, NICU, dan PICU dengan monitoring 24 jam',
      fullDescription: 'Unit Perawatan Intensif menyediakan perawatan khusus untuk pasien dengan kondisi kritis. Dilengkapi dengan peralatan monitoring canggih dan rasio perawat-pasien yang optimal untuk memastikan perawatan terbaik.',
      color: 'from-primary-dark to-primary',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop',
      features: [
        'ICU (Intensive Care Unit) 20 bed',
        'ICCU (Cardiac Care) 10 bed',
        'NICU (Neonatal) 15 bed',
        'PICU (Pediatric) 8 bed',
        'Monitoring 24 jam',
        'Ventilator dan life support lengkap'
      ],
      doctors: [
        { name: 'Dr. Intensivist Team', specialty: 'Tim ICU', schedule: '24 Jam' },
      ],
      facilities: ['Monitor bedside', 'Ventilator', 'Infusion pump', 'Defibrilator', 'CRRT'],
      procedures: ['Admission Criteria', 'Monitoring Ketat', 'Daily Assessment', 'Weaning', 'Step Down'],
    },
    supporting: {
      icon: FlaskConical,
      title: 'Penunjang Medis',
      description: 'Laboratorium, radiologi, farmasi, dan rehabilitasi medik',
      fullDescription: 'Layanan penunjang medis lengkap meliputi laboratorium dengan berbagai pemeriksaan, radiologi dengan CT Scan dan MRI, farmasi 24 jam, serta unit rehabilitasi medik untuk pemulihan optimal.',
      color: 'from-secondary to-primary',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=500&fit=crop',
      features: [
        'Laboratorium terakreditasi',
        'Radiologi: X-Ray, USG, CT Scan, MRI',
        'Farmasi 24 jam',
        'Rehabilitasi medik lengkap',
        'Bank darah',
        'Hemodialisa'
      ],
      doctors: [
        { name: 'Dr. Laboratorium Team', specialty: 'Patologi Klinik', schedule: '24 Jam' },
        { name: 'Dr. Radiologi Team', specialty: 'Radiologi', schedule: '24 Jam' },
      ],
      facilities: ['Lab lengkap', 'CT Scan 128 slice', 'MRI 3T', 'USG 4D', 'Fisioterapi'],
      procedures: ['Pengambilan Sampel', 'Pemeriksaan', 'Analisis', 'Pelaporan', 'Konsultasi Hasil'],
    },
    specialist: {
      icon: Heart,
      title: 'Klinik Spesialis',
      description: 'Lebih dari 20 klinik spesialis dengan dokter berpengalaman',
      fullDescription: `${hospitalName} memiliki lebih dari 20 klinik spesialis yang melayani berbagai kebutuhan kesehatan. Setiap klinik dipimpin oleh dokter spesialis berpengalaman dengan jadwal praktik yang fleksibel.`,
      color: 'from-accent to-accent/80',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=500&fit=crop',
      features: [
        'Jantung dan Pembuluh Darah',
        'Penyakit Dalam',
        'Bedah (Umum, Ortopedi, Saraf, dll)',
        'Kebidanan dan Kandungan',
        'Anak',
        'Mata, THT, Kulit, Gigi'
      ],
      doctors: [
        { name: 'Dr. Ahmad Wijaya, Sp.JP', specialty: 'Kardiologi', schedule: 'Senin, Rabu, Jumat' },
        { name: 'Dr. Siti Rahayu, Sp.A', specialty: 'Anak', schedule: 'Senin - Jumat' },
        { name: 'Dr. Maya Putri, Sp.OG', specialty: 'Kebidanan', schedule: 'Senin - Jumat' },
      ],
      facilities: ['Ruang periksa modern', 'Alat diagnostik lengkap', 'Minor surgery room'],
      procedures: ['Registrasi', 'Anamnesis', 'Pemeriksaan Fisik', 'Diagnostik', 'Terapi/Tindakan'],
    },
  };

  const service = type ? servicesData[type] : null;

  if (!service) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Layanan tidak ditemukan</h1>
            <Link to="/services">
              <Button variant="medical">Kembali ke Daftar Layanan</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const Icon = service.icon;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${service.image})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-90`} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-white/80 text-sm">Layanan Kesehatan</span>
                <h1 className="text-3xl md:text-5xl font-bold">{service.title}</h1>
              </div>
            </div>
            <p className="text-lg text-white/90 leading-relaxed">
              {service.fullDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">Keunggulan Layanan</h2>
              <div className="space-y-4">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">Alur Pelayanan</h2>
              <div className="space-y-4">
                {service.procedures.map((procedure, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{procedure}</span>
                    {idx < service.procedures.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Tim Dokter</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {service.doctors.map((doctor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card-medical p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{doctor.name}</h3>
                <p className="text-sm text-primary mb-2">{doctor.specialty}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {doctor.schedule}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Fasilitas</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {service.facilities.map((facility, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-2 rounded-full bg-muted border flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-primary" />
                {facility}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Butuh Layanan {service.title}?
            </h2>
            <p className="text-white/80 mb-8">
              Buat janji temu atau hubungi kami untuk informasi lebih lanjut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/appointment">
                <Button variant="hero" size="lg" className="gap-2">
                  <Calendar className="w-5 h-5" />
                  Buat Janji Temu
                </Button>
              </Link>
              <a href="tel:02112345678">
                <Button variant="heroOutline" size="lg" className="gap-2">
                  <Phone className="w-5 h-5" />
                  (021) 1234-5678
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceDetailPage;
