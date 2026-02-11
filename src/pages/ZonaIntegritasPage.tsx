import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, FileCheck, Users, Target, Download, CheckCircle, Star, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useSettings } from "@/hooks/useSettings";

const ZonaIntegritasPage = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const defaultAchievements = [
    { year: 2023, title: "Predikat WBK", description: "Wilayah Bebas dari Korupsi" },
    { year: 2022, title: "Nilai SAKIP A", description: "Akuntabilitas Kinerja Sangat Baik" },
    { year: 2021, title: "Sertifikasi ISO", description: "ISO 9001:2015 Quality Management" },
  ];

  const achievements = settings?.zi_settings?.achievements && settings.zi_settings.achievements.length > 0
    ? settings.zi_settings.achievements
    : defaultAchievements;

  const defaultPrograms = [
    { title: "Pelayanan Prima", description: "Komitmen memberikan pelayanan terbaik kepada masyarakat", icon: "Star" },
    { title: "Transparansi Anggaran", description: "Keterbukaan informasi penggunaan anggaran", icon: "FileCheck" },
    { title: "Integritas Pegawai", description: "Penguatan nilai-nilai integritas aparatur", icon: "Users" },
    { title: "Pencegahan Korupsi", description: "Sistem pengendalian gratifikasi dan pelaporan", icon: "Shield" },
  ];

  const programs = settings?.zi_settings?.programs && settings.zi_settings.programs.length > 0
    ? settings.zi_settings.programs
    : defaultPrograms;

  const iconMap: any = { Star, FileCheck, Users, Shield, Target, Award, CheckCircle };
  const getIcon = (name: string) => iconMap[name] || Star;

  // Helper to parse newline separated list
  const parseList = (text: string | undefined, defaultList: string[]) => {
    if (!text) return defaultList;
    return text.split('\n').filter(line => line.trim() !== '');
  };

  const defaultWbkProcess = [
    "Manajemen Perubahan", "Penataan Tata Laksana", "Penataan Sistem Manajemen SDM",
    "Penguatan Akuntabilitas", "Penguatan Pengawasan", "Peningkatan Kualitas Pelayanan Publik"
  ];
  const wbkProcess = parseList(settings?.zi_settings?.indikators?.wbk_process, defaultWbkProcess);

  const defaultWbkResult = [
    "Terwujudnya pemerintahan yang bersih dan bebas KKN",
    "Terwujudnya peningkatan kualitas pelayanan publik"
  ];
  const wbkResult = parseList(settings?.zi_settings?.indikators?.wbk_result, defaultWbkResult);

  const defaultWbbmSyarat = [
    "Survei Persepsi Anti Korupsi (SPAK) ≥ 3.60",
    "Survei Persepsi Kualitas Pelayanan (SPKP) ≥ 3.60",
    "Tidak ada pegawai yang terjerat kasus korupsi",
    "Nilai SAKIP minimal B"
  ];
  const wbbmSyarat = parseList(settings?.zi_settings?.indikators?.wbbm_syarat, defaultWbbmSyarat);

  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ['ppid-zi'],
    queryFn: () => api.ppid.getAll({ category: 'zona_integritas', isPublic: true }),
  });

  const documents = Array.isArray(documentsData) ? documentsData : (documentsData as any)?.data || [];

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Zona Integritas</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Komitmen {settings?.name || "RS Soewandhie"} menuju Wilayah Bebas dari Korupsi (WBK)
              dan Wilayah Birokrasi Bersih Melayani (WBBM)
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="wbk" className="space-y-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="wbk">WBK</TabsTrigger>
                <TabsTrigger value="wbbm">WBBM</TabsTrigger>
              </TabsList>

              <TabsContent value="wbk">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <CardTitle className="text-2xl">Wilayah Bebas dari Korupsi</CardTitle>
                      <CardDescription className="text-lg">
                        Predikat bagi unit kerja yang memenuhi indikator hasil terkait pencegahan korupsi
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">Indikator Proses</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {wbkProcess.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-6 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">Indikator Hasil</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {wbkResult.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge variant="secondary" className="text-lg py-2 px-4">
                          <Award className="w-5 h-5 mr-2" />
                          Status: {settings?.zi_settings?.status?.wbk_text || "Predikat WBK"} ({settings?.zi_settings?.status?.wbk_year || 2023})
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="wbbm">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-2xl">Wilayah Birokrasi Bersih Melayani</CardTitle>
                      <CardDescription className="text-lg">
                        Target tertinggi dalam pembangunan Zona Integritas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-center text-muted-foreground">
                        WBBM merupakan predikat yang diberikan kepada unit kerja yang memenuhi
                        indikator hasil WBK ditambah dengan indikator hasil terkait peningkatan
                        kualitas pelayanan publik.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border rounded-lg">
                          <h4 className="font-semibold mb-3">Syarat Tambahan WBBM</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {wbbmSyarat.map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-6 border rounded-lg">
                          <h4 className="font-semibold mb-3">Capaian Kami</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between">
                              <span>SPAK</span>
                              <span className="font-semibold text-green-600">{settings?.zi_settings?.scores?.spak || "3.72"}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>SPKP</span>
                              <span className="font-semibold text-green-600">{settings?.zi_settings?.scores?.spkp || "3.85"}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Nilai SAKIP</span>
                              <span className="font-semibold text-green-600">{settings?.zi_settings?.scores?.sakip || "A"}</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge className="text-lg py-2 px-4">
                          <Target className="w-5 h-5 mr-2" />
                          <Target className="w-5 h-5 mr-2" />
                          Target: {settings?.zi_settings?.status?.wbbm_target_text || "WBBM"} {settings?.zi_settings?.status?.wbbm_target_year || 2024}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Programs */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Program Zona Integritas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((program: any, idx: number) => {
                const Icon = getIcon(program.icon);
                return (
                  <Card key={idx}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{program.title}</h3>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Pencapaian</h2>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                {achievements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <Badge variant="outline">{item.year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Dokumen Zona Integritas</h2>
            <div className="max-w-2xl mx-auto">
              {isDocumentsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : !documents || documents.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-background">
                  <p className="text-muted-foreground">Belum ada dokumen yang tersedia.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-primary" />
                        <span className="font-medium">{doc.title}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(doc.fileSize)})</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.open(doc.fileUrl, '_blank')}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ZonaIntegritasPage;
