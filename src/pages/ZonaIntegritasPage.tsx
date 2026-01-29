import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, FileCheck, Users, Target, Download, CheckCircle, Star } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const ZonaIntegritasPage = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const achievements = [
    { year: 2023, title: "Predikat WBK", description: "Wilayah Bebas dari Korupsi" },
    { year: 2022, title: "Nilai SAKIP A", description: "Akuntabilitas Kinerja Sangat Baik" },
    { year: 2021, title: "Sertifikasi ISO", description: "ISO 9001:2015 Quality Management" },
  ];

  const programs = [
    {
      title: "Pelayanan Prima",
      description: "Komitmen memberikan pelayanan terbaik kepada masyarakat",
      icon: Star,
    },
    {
      title: "Transparansi Anggaran",
      description: "Keterbukaan informasi penggunaan anggaran",
      icon: FileCheck,
    },
    {
      title: "Integritas Pegawai",
      description: "Penguatan nilai-nilai integritas aparatur",
      icon: Users,
    },
    {
      title: "Pencegahan Korupsi",
      description: "Sistem pengendalian gratifikasi dan pelaporan",
      icon: Shield,
    },
  ];

  const documents = [
    { title: "Pakta Integritas 2024", size: "1.2 MB" },
    { title: "Laporan Gratifikasi 2023", size: "2.5 MB" },
    { title: "SK Tim Zona Integritas", size: "0.8 MB" },
    { title: "Rencana Aksi ZI 2024", size: "3.1 MB" },
  ];

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
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Manajemen Perubahan
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Penataan Tata Laksana
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Penataan Sistem Manajemen SDM
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Penguatan Akuntabilitas
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Penguatan Pengawasan
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Peningkatan Kualitas Pelayanan Publik
                            </li>
                          </ul>
                        </div>
                        <div className="p-6 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">Indikator Hasil</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Terwujudnya pemerintahan yang bersih dan bebas KKN
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Terwujudnya peningkatan kualitas pelayanan publik
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge variant="secondary" className="text-lg py-2 px-4">
                          <Award className="w-5 h-5 mr-2" />
                          Status: Predikat WBK (2023)
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
                            <li>• Survei Persepsi Anti Korupsi (SPAK) ≥ 3.60</li>
                            <li>• Survei Persepsi Kualitas Pelayanan (SPKP) ≥ 3.60</li>
                            <li>• Tidak ada pegawai yang terjerat kasus korupsi</li>
                            <li>• Nilai SAKIP minimal B</li>
                          </ul>
                        </div>
                        <div className="p-6 border rounded-lg">
                          <h4 className="font-semibold mb-3">Capaian Kami</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between">
                              <span>SPAK</span>
                              <span className="font-semibold text-green-600">3.72</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>SPKP</span>
                              <span className="font-semibold text-green-600">3.85</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Nilai SAKIP</span>
                              <span className="font-semibold text-green-600">A</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge className="text-lg py-2 px-4">
                          <Target className="w-5 h-5 mr-2" />
                          Target: WBBM 2024
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
              {programs.map((program, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <program.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{program.title}</h3>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  </CardContent>
                </Card>
              ))}
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
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-primary" />
                      <span>{doc.title}</span>
                      <span className="text-xs text-muted-foreground">({doc.size})</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ZonaIntegritasPage;
