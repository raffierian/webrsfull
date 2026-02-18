import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Target,
  Eye,
  Heart,
  Award,
  Users,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useSettings } from '@/hooks/useSettings';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const milestones = [
    { year: '1999', title: 'Pendirian', description: 'RS Harapan Sehat didirikan dengan 50 tempat tidur' },
    { year: '2005', title: 'Akreditasi', description: 'Memperoleh akreditasi penuh dari KARS' },
    { year: '2012', title: 'Ekspansi', description: 'Perluasan gedung dengan 300 tempat tidur' },
    { year: '2018', title: 'Digitalisasi', description: 'Implementasi sistem rekam medis elektronik' },
    { year: '2023', title: 'Excellence', description: 'Meraih akreditasi paripurna dan berbagai penghargaan' },
  ];

  const values = [
    { icon: Heart, title: 'Kasih Sayang', description: 'Melayani dengan hati dan empati' },
    { icon: Award, title: 'Profesional', description: 'Standar pelayanan berkualitas tinggi' },
    { icon: Users, title: 'Kerjasama', description: 'Tim yang solid dan terintegrasi' },
    { icon: Target, title: 'Integritas', description: 'Jujur dan bertanggung jawab' },
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Profil Rumah Sakit</h1>
            <p className="text-lg text-white/80">
              Mengenal lebih dekat RS Harapan Sehat, rumah sakit yang melayani dengan sepenuh hati
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Melayani dengan
                <span className="text-primary"> Sepenuh Hati</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                {settings?.profile_settings?.about || "RS Harapan Sehat adalah rumah sakit swasta terkemuka yang telah melayani masyarakat selama lebih dari 25 tahun. Dengan tenaga medis profesional dan fasilitas modern, kami berkomitmen memberikan pelayanan kesehatan berkualitas internasional."}
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{settings?.profile_settings?.stats?.experience || "25+"}</div>
                  <div className="text-sm text-muted-foreground">Tahun Pengalaman</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{settings?.profile_settings?.stats?.beds || "500+"}</div>
                  <div className="text-sm text-muted-foreground">Tempat Tidur</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{settings?.profile_settings?.stats?.patients || "50K+"}</div>
                  <div className="text-sm text-muted-foreground">Pasien/Tahun</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={settings?.profile_settings?.aboutImages?.[0] || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=500&fit=crop"}
                alt={settings?.name || "RS Soewandhie"}
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-medical p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Visi</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {settings?.profile_settings?.vision || "Menjadi rumah sakit rujukan terpercaya dengan pelayanan kesehatan berkualitas internasional yang mengutamakan keselamatan pasien dan kepuasan pelanggan."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-medical p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Misi</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {settings?.profile_settings?.mission || (
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Memberikan pelayanan kesehatan yang bermutu dan terjangkau</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Mengembangkan SDM yang profesional dan berintegritas</span>
                    </li>
                  </ul>
                )}
              </div>
            </motion.div>

            {(settings?.profile_settings?.moto || settings?.profile_settings?.maklumat) && (
              <div className="col-span-1 md:col-span-2 grid md:grid-cols-2 gap-8 mt-6">
                {settings?.profile_settings?.moto && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-medical p-8 bg-primary text-white"
                  >
                    <h3 className="text-xl font-bold mb-2">Moto Kami</h3>
                    <p className="text-lg italic">"{settings.profile_settings.moto}"</p>
                  </motion.div>
                )}
                {settings?.profile_settings?.maklumat && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-medical p-8 border-primary/20 bg-primary/5"
                  >
                    <h3 className="text-xl font-bold mb-2 text-primary">Maklumat Pelayanan</h3>
                    <p className="text-muted-foreground">{settings.profile_settings.maklumat}</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Nilai-Nilai Kami
            </span>
            <h2 className="text-3xl font-bold">Nilai Inti</h2>
          </motion.div>

          {settings?.profile_settings?.values ? (
            <div className="card-medical p-8 text-center max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
                {settings.profile_settings.values}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="card-medical p-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Timeline / History */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Perjalanan Kami
            </span>
            <h2 className="text-3xl font-bold">Sejarah & Milestone</h2>
          </motion.div>

          {settings?.profile_settings?.history ? (
            <div className="card-medical p-8 max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
                {settings.profile_settings.history}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-6 mb-8"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                    {idx < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/20 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="card-medical p-6">
                      <div className="text-sm text-primary font-medium mb-1">{milestone.year}</div>
                      <h3 className="text-lg font-bold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Butuh Layanan Kesehatan?
            </h2>
            <p className="text-white/80 mb-6">
              Kami siap melayani Anda dengan sepenuh hati.
            </p>
            <Link to="/appointment">
              <Button variant="hero" size="lg" className="gap-2">
                Buat Janji Temu
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProfilePage;
