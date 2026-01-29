import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  CheckCircle,
  ArrowLeft,
  User,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { api } from '@/services/api';

interface Training {
  id: string;
  title: string;
  slug: string;
  description: string;
  trainer: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  registeredCount: number;
  fee: number | null;
  imageUrl: string | null;
  lmsUrl: string | null;
  registrationUrl: string | null;
  skp: number | null;
  jp: number | null;
  certificateInfo: string | null;
}

const TrainingDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraining = async () => {
      if (!slug) return;
      try {
        const data = await api.trainings.getBySlug(slug);
        setTraining(data);
      } catch (error) {
        console.error("Failed to fetch training detail:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTraining();
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Memuat detail pelatihan...</p>
        </div>
      </Layout>
    );
  }

  if (!training) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pelatihan tidak ditemukan</h1>
            <Link to="/training">
              <Button>Lihat Daftar Pelatihan</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const availableSpots = training.maxParticipants - training.registeredCount;
  const percentageFilled = (training.registeredCount / training.maxParticipants) * 100;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-blue-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${training.imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop"})` }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Link to="/training" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 border-b border-white/20 pb-1 translate-y-0 hover:-translate-y-1 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Pelatihan
            </Link>
            <div className="flex flex-wrap gap-2 mb-6">
              {training.skp && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none py-1.5 px-3">
                  {training.skp} SKP Kemkes
                </Badge>
              )}
              {training.jp && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none py-1.5 px-3">
                  {training.jp} JP
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{training.title}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-white/90 text-lg">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Calendar className="w-6 h-6 text-primary-foreground" />
                {new Date(training.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <MapPin className="w-6 h-6 text-primary-foreground" />
                {training.location || "Online"}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Users className="w-6 h-6 text-primary-foreground" />
                {training.registeredCount}/{training.maxParticipants} Peserta
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <GraduationCap className="w-7 h-7 text-primary" />
                  Deskripsi Pelatihan
                </h2>
                <div className="prose prose-blue max-w-none text-muted-foreground leading-relaxed">
                  {training.description}
                </div>
              </div>

              {training.trainer && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                  <h2 className="text-2xl font-bold mb-6">Narasumber / Instruktur</h2>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{training.trainer}</h3>
                      <p className="text-muted-foreground">Pakar & Praktisi Profesional</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-3xl shadow-sm border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-7 h-7 text-orange-600" />
                  Sertifikasi Kemkes
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">{training.certificateInfo || "Sertifikat Resmi Kemkes RI"}</p>
                      <p className="text-sm text-orange-800/80 mt-1">Dapat diklaim setelah menyelesaikan seluruh rangkaian pelatihan dan evaluasi.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border bg-slate-50 text-center">
                      <p className="text-sm text-muted-foreground">Satuan Kredit Profesi</p>
                      <p className="text-3xl font-bold text-primary">{training.skp || 0} SKP</p>
                    </div>
                    <div className="p-4 rounded-2xl border bg-slate-50 text-center">
                      <p className="text-sm text-muted-foreground">Jam Pelajaran</p>
                      <p className="text-3xl font-bold text-primary">{training.jp || 0} JP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Registration */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-primary/10 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Investasi Pelatihan</p>
                  <div className="text-4xl font-bold text-primary">
                    {training.fee && training.fee > 0
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(training.fee)
                      : 'GRATIS'}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Ketersediaan Kursi</span>
                    <span className="font-bold">{training.registeredCount}/{training.maxParticipants} Peserta</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${percentageFilled > 90 ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${percentageFilled}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-orange-600 mt-2">
                    {availableSpots > 0 ? `Cepat! Tersisa ${availableSpots} tempat lagi.` : 'Mohon maaf, kuota pendaftaran sudah penuh.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {training.lmsUrl && (
                    <a href={training.lmsUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full gap-2 rounded-xl text-lg h-14 bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-5 h-5" />
                        Buka LMS Kemkes
                      </Button>
                    </a>
                  )}

                  {training.registrationUrl && (
                    <a href={training.registrationUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
                      <Button variant="outline" size="lg" className="w-full gap-2 rounded-xl text-lg h-14 border-2">
                        <ExternalLink className="w-5 h-5" />
                        Link Pendaftaran
                      </Button>
                    </a>
                  )}

                  {!training.lmsUrl && !training.registrationUrl && (
                    <Button size="lg" className="w-full gap-2 rounded-xl text-lg h-14" disabled={availableSpots <= 0}>
                      Daftar Sekarang
                    </Button>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span>Sertifikat Berbasis SKP & JP Resmi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Materi Pelatihan Lengkap</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TrainingDetailPage;
