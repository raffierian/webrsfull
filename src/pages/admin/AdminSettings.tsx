import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Shield,
  Palette,
  Save,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  QrCode,
  Smartphone,
  Briefcase,
  Plus,
  Trash2,
  ListPlus,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default states
  const defaultHospitalSettings = {
    name: "RS Soewandhie",
    tagline: "Melayani dengan Sepenuh Hati",
    email: "info@rs-soewandhie.com",
    admissionEmail: "pendaftaran@rs-soewandhie.com",
    careerEmail: "hrd@rs-soewandhie.com",
    phone: "(031) 3717141",
    whatsapp: "6281234567890",
    address: "Jl. Tambak Rejo No.45-47, Simokerto, Surabaya",
    website: "https://rs-soewandhie.surabaya.go.id",
    description: "Rumah Sakit Umum Daerah dr. Mohamad Soewandhie adalah rumah sakit milik Pemerintah Kota Surabaya.",
    emergencyPhone: "",
    operatingHours: "",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.886369062334!2d112.75338331477484!3d-7.253776994763435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f975765c3fd3%3A0xc6657685970c64c7!2sRSUD%20Dr.%20Mohamad%20Soewandhie!5e0!3m2!1sen!2sid!4v1645498263123!5m2!1sen!2sid",
  };

  const defaultProfileSettings = {
    vision: "Menjadi rumah sakit terpercaya pilihan masyarakat.",
    mission: "1. Memberikan pelayanan kesehatan yang bermutu.\n2. Mengembangkan SDM yang profesional.\n3. Menyediakan fasilitas modern.",
    moto: "Kesembuhan Anda adalah Kebahagiaan Kami",
    maklumat: "Kami berjanji dan sanggup melaksanakan pelayanan sesuai dengan standar pelayanan.",
    about: "Selama lebih dari 25 tahun, RS Harapan Sehat telah menjadi pilihan utama masyarakat dalam mendapatkan pelayanan kesehatan berkualitas. Dengan tenaga medis profesional dan fasilitas modern, kami berkomitmen untuk memberikan pelayanan terbaik.",
    history: "RS Harapan Sehat didirikan pada tahun 1999 dengan visi untuk memberikan pelayanan kesehatan yang terjangkau dan berkualitas bagi masyarakat Surabaya.",
    values: "Profesionalisme, Integritas, Empati, dan Inovasi.",
    aboutImages: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop"
    ],
    aboutFeatures: [
      "Tenaga medis profesional dan bersertifikasi",
      "Peralatan medis modern dan terkini",
      "Pelayanan 24 jam untuk gawat darurat",
      "Sistem rekam medis terintegrasi",
      "Fasilitas rawat inap yang nyaman",
      "Program kesehatan preventif"
    ],
    stats: {
      patients: "50,000+",
      doctors: "120+",
      experience: "25+",
      satisfaction: "98%"
    }
  };

  const defaultExternalLinks = {
    zonaIntegritas: "",
    wbs: "",
    lapor: "",
    enableChatbot: true,
    enableWhatsapp: true,
    consultationEnabled: true,
    enablePatientPortal: true,
    googleReviews: {
      enabled: false,
      placeId: ""
    }
  };

  const defaultNotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
    systemAlerts: true,
  };

  const defaultSecuritySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
  };

  const defaultAppearanceSettings = {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0ea5e9", // Sky-500 default
    secondaryColor: "#64748b",
  };

  const defaultServiceStandards = {
    description: "Kami berkomitmen untuk memberikan pelayanan kesehatan sesuai dengan standar kualitas nasional dan internasional.",
    maklumat: "Menyanggupi Pelayanan Medis yang Cepat, Tepat, dan Akurat.",
    promise: "Melayani dengan Sepenuh Hati (S - Senyum, S - Salam, S - Sapa).",
  };

  const defaultInnovations = [
    { title: "E-Medical Record", description: "Rekam medis elektronik terintegrasi untuk kecepatan layanan.", icon: "TrendingUp" },
    { title: "Telemedicine", description: "Layanan konsultasi online dari rumah Anda.", icon: "Shield" },
  ];

  const defaultZISettings = {
    achievements: [
      { year: 2023, title: "Predikat WBK", description: "Wilayah Bebas dari Korupsi" },
      { year: 2022, title: "Nilai SAKIP A", description: "Akuntabilitas Kinerja Sangat Baik" },
    ],
    scores: {
      spak: "3.72",
      spkp: "3.85",
      sakip: "A"
    },
    status: {
      wbk_text: "Predikat WBK",
      wbk_year: 2023,
      wbbm_target_text: "WBBM",
      wbbm_target_year: 2024
    },
    programs: [
      { title: "Pelayanan Prima", description: "Komitmen memberikan pelayanan terbaik kepada masyarakat", icon: "Star" },
      { title: "Transparansi Anggaran", description: "Keterbukaan informasi penggunaan anggaran", icon: "FileCheck" },
      { title: "Integritas Pegawai", description: "Penguatan nilai-nilai integritas aparatur", icon: "Users" },
      { title: "Pencegahan Korupsi", description: "Sistem pengendalian gratifikasi dan pelaporan", icon: "Shield" },
    ],
    indikators: {
      wbk_process: "Manajemen Perubahan\nPenataan Tata Laksana\nPenataan Sistem Manajemen SDM\nPenguatan Akuntabilitas\nPenguatan Pengawasan\nPeningkatan Kualitas Pelayanan Publik",
      wbk_result: "Terwujudnya pemerintahan yang bersih dan bebas KKN\nTerwujudnya peningkatan kualitas pelayanan publik",
      wbbm_syarat: "Survei Persepsi Anti Korupsi (SPAK) ≥ 3.60\nSurvei Persepsi Kualitas Pelayanan (SPKP) ≥ 3.60\nTidak ada pegawai yang terjerat kasus korupsi\nNilai SAKIP minimal B"
    }
  };

  const [hospitalSettings, setHospitalSettings] = useState(defaultHospitalSettings);
  const [profileSettings, setProfileSettings] = useState(defaultProfileSettings);
  const [externalLinks, setExternalLinks] = useState(defaultExternalLinks);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [appearanceSettings, setAppearanceSettings] = useState(defaultAppearanceSettings);
  const [serviceStandards, setServiceStandards] = useState(defaultServiceStandards);
  const [innovations, setInnovations] = useState(defaultInnovations);
  const [ziSettings, setZISettings] = useState(defaultZISettings);
  const [newAchievement, setNewAchievement] = useState({ year: new Date().getFullYear(), title: "", description: "" });

  // New Innovation State
  const [newInnovation, setNewInnovation] = useState({ title: "", description: "" });



  // Fetch Settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.settings.getAll(),
  });

  // Sync state with fetched data
  useEffect(() => {
    if (settingsData) {
      if (settingsData.hospital_settings) setHospitalSettings({ ...defaultHospitalSettings, ...settingsData.hospital_settings });
      if (settingsData.profile_settings) setProfileSettings({ ...defaultProfileSettings, ...settingsData.profile_settings });
      if (settingsData.external_links) setExternalLinks({ ...defaultExternalLinks, ...settingsData.external_links });
      if (settingsData.notification_settings) setNotificationSettings({ ...defaultNotificationSettings, ...settingsData.notification_settings });
      if (settingsData.security_settings) setSecuritySettings({ ...defaultSecuritySettings, ...settingsData.security_settings });
      if (settingsData.appearance_settings) setAppearanceSettings({ ...defaultAppearanceSettings, ...settingsData.appearance_settings });
      if (settingsData.service_standards) setServiceStandards({ ...defaultServiceStandards, ...settingsData.service_standards });
      if (settingsData.innovations) setInnovations(settingsData.innovations.length ? settingsData.innovations : defaultInnovations);
      if (settingsData.zi_settings) setZISettings({ ...defaultZISettings, ...settingsData.zi_settings });
    }
  }, [settingsData]);



  // Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({ title: "Berhasil", description: "Pengaturan berhasil disimpan" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  const handleSaveHospital = () => updateSettingsMutation.mutate({ hospital_settings: hospitalSettings });
  const handleSaveProfile = () => updateSettingsMutation.mutate({ profile_settings: profileSettings });
  const handleSaveLinks = () => updateSettingsMutation.mutate({ external_links: externalLinks });
  const handleSaveNotifications = () => updateSettingsMutation.mutate({ notification_settings: notificationSettings });
  const handleSaveSecurity = () => updateSettingsMutation.mutate({ security_settings: securitySettings });
  const handleSaveAppearance = () => updateSettingsMutation.mutate({ appearance_settings: appearanceSettings });
  const handleSaveServices = () => updateSettingsMutation.mutate({
    service_standards: serviceStandards,
    innovations: innovations
  });
  const handleSaveZI = () => updateSettingsMutation.mutate({ zi_settings: ziSettings });

  const handleAddInnovation = () => {
    if (!newInnovation.title || !newInnovation.description) return;
    setInnovations([...innovations, { ...newInnovation, icon: "TrendingUp" }]);
    setNewInnovation({ title: "", description: "" });
  };

  const handleDeleteInnovation = (idx: number) => {
    const newInnovations = [...innovations];
    newInnovations.splice(idx, 1);
    setInnovations(newInnovations);
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.description) return;
    setZISettings({
      ...ziSettings,
      achievements: [newAchievement, ...ziSettings.achievements]
    });
    setNewAchievement({ year: new Date().getFullYear(), title: "", description: "" });
  };

  const handleDeleteAchievement = (idx: number) => {
    const newAchievements = [...ziSettings.achievements];
    newAchievements.splice(idx, 1);
    setZISettings({ ...ziSettings, achievements: newAchievements });
  };

  const handleProgramChange = (idx: number, field: string, value: string) => {
    const newPrograms = [...ziSettings.programs];
    newPrograms[idx] = { ...newPrograms[idx], [field]: value };
    setZISettings({ ...ziSettings, programs: newPrograms });
  };



  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan & Profil</h1>
        <p className="text-muted-foreground">Kelola profil rumah sakit, link eksternal, dan konfigurasi sistem</p>
      </div>

      <Tabs defaultValue="hospital" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 overflow-x-auto">
          <TabsTrigger value="hospital" className="flex items-center gap-2 min-w-[100px]">
            <Building2 className="w-4 h-4" />
            <span className="hidden xl:inline">Info RS</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 min-w-[100px]">
            <FileText className="w-4 h-4" />
            <span className="hidden xl:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2 min-w-[100px]">
            <LinkIcon className="w-4 h-4" />
            <span className="hidden xl:inline">Links</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 min-w-[100px]">
            <Bell className="w-4 h-4" />
            <span className="hidden xl:inline">Notifikasi</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 min-w-[100px]">
            <Shield className="w-4 h-4" />
            <span className="hidden xl:inline">Keamanan</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 min-w-[100px]">
            <Palette className="w-4 h-4" />
            <span className="hidden xl:inline">Tampilan</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2 min-w-[100px]">
            <Briefcase className="w-4 h-4" />
            <span className="hidden xl:inline">Layanan</span>
          </TabsTrigger>
          <TabsTrigger value="zi" className="flex items-center gap-2 min-w-[100px]">
            <Award className="w-4 h-4" />
            <span className="hidden xl:inline">Zona Integritas</span>
          </TabsTrigger>
        </TabsList>

        {/* Hospital Settings */}
        <TabsContent value="hospital">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Rumah Sakit</CardTitle>
              <CardDescription>Pengaturan umum informasi rumah sakit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Rumah Sakit</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={hospitalSettings.name}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={hospitalSettings.tagline}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, tagline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Informasi (Utama)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      className="pl-10"
                      value={hospitalSettings.email}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Pendaftaran</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      type="email"
                      value={hospitalSettings.admissionEmail || ''}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, admissionEmail: e.target.value })}
                      placeholder="pendaftaran@rs-soewandhie.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Karir (HRD)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      type="email"
                      value={hospitalSettings.careerEmail || ''}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, careerEmail: e.target.value })}
                      placeholder="hrd@rs-soewandhie.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telepon Utama</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={hospitalSettings.phone}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nomor WhatsApp (628...)</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={hospitalSettings.whatsapp}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, whatsapp: e.target.value })}
                      placeholder="62812345678"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nomor Darurat (IGD)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground text-red-500" />
                    <Input
                      className="pl-10 border-red-200 focus-visible:ring-red-500"
                      value={hospitalSettings.emergencyPhone || ''}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, emergencyPhone: e.target.value })}
                      placeholder="(031) 37309595"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Jam Operasional</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={hospitalSettings.operatingHours || ''}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, operatingHours: e.target.value })}
                      placeholder="Contoh: Senin - Minggu (24 Jam)"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat Lengkap</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      className="pl-10 resize-none"
                      rows={2}
                      value={hospitalSettings.address}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Google Maps Embed URL</Label>
                  <Input
                    value={hospitalSettings.mapUrl || ''}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, mapUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy link dari Google Maps: Share &gt; Embed a map &gt; Copy HTML (ambil bagian src="...")
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveHospital} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Rumah Sakit</CardTitle>
              <CardDescription>Kelola Visi, Misi, Moto, dan Maklumat Pelayanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about">Tentang Kami (Homepage)</Label>
                  <Textarea
                    id="about"
                    value={profileSettings.about}
                    onChange={(e) => setProfileSettings({ ...profileSettings, about: e.target.value })}
                    placeholder="Deskripsi singkat tentang rumah sakit yang akan muncul di homepage"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visi</Label>
                  <Textarea
                    value={profileSettings.vision}
                    onChange={(e) => setProfileSettings({ ...profileSettings, vision: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Misi</Label>
                  <Textarea
                    value={profileSettings.mission}
                    onChange={(e) => setProfileSettings({ ...profileSettings, mission: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moto</Label>
                  <Input
                    value={profileSettings.moto}
                    onChange={(e) => setProfileSettings({ ...profileSettings, moto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maklumat">Maklumat Pelayanan</Label>
                  <Textarea
                    id="maklumat"
                    value={profileSettings.maklumat}
                    onChange={(e) => setProfileSettings({ ...profileSettings, maklumat: e.target.value })}
                    placeholder="Maklumat pelayanan rumah sakit..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="history">Sejarah Singkat</Label>
                  <Textarea
                    id="history"
                    value={profileSettings.history || ''}
                    onChange={(e) => setProfileSettings({ ...profileSettings, history: e.target.value })}
                    placeholder="Ceritakan sejarah singkat rumah sakit..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="values">Nilai-Nilai (Values)</Label>
                  <Textarea
                    id="values"
                    value={profileSettings.values || ''}
                    onChange={(e) => setProfileSettings({ ...profileSettings, values: e.target.value })}
                    placeholder="Nilai-nilai utama rumah sakit..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Tampilan Homepage (Tentang Kami)</h3>

                <div className="space-y-2">
                  <Label>Poin Keunggulan (Satu per baris)</Label>
                  <Textarea
                    value={Array.isArray(profileSettings.aboutFeatures) ? profileSettings.aboutFeatures.join('\n') : (profileSettings.aboutFeatures || [])}
                    onChange={(e) => setProfileSettings({ ...profileSettings, aboutFeatures: e.target.value.split('\n') })}
                    rows={6}
                    placeholder="Masukkan poin keunggulan, pisahkan dengan Enter"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Galeri Foto (4 Foto Utama)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">URL Foto {idx + 1}</Label>
                        <Input
                          value={profileSettings.aboutImages?.[idx] || ''}
                          onChange={(e) => {
                            const newImages = [...(profileSettings.aboutImages || [])];
                            if (!profileSettings.aboutImages) {
                              // Fill with existing or empty if undef
                              for (let i = 0; i < 4; i++) newImages[i] = newImages[i] || "";
                            }
                            newImages[idx] = e.target.value;
                            setProfileSettings({ ...profileSettings, aboutImages: newImages });
                          }}
                          placeholder={`https://example.com/image-${idx + 1}.jpg`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Statistik Utama</h3>
                </div>
                <div className="space-y-2">
                  <Label>Pasien Dilayani</Label>
                  <Input
                    value={profileSettings.stats?.patients || "50,000+"}
                    onChange={(e) => setProfileSettings({ ...profileSettings, stats: { ...profileSettings.stats, patients: e.target.value } })}
                    placeholder="contoh: 50,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dokter Spesialis</Label>
                  <Input
                    value={profileSettings.stats?.doctors || "120+"}
                    onChange={(e) => setProfileSettings({ ...profileSettings, stats: { ...profileSettings.stats, doctors: e.target.value } })}
                    placeholder="contoh: 120+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tahun Pengalaman</Label>
                  <Input
                    value={profileSettings.stats?.experience || "25+"}
                    onChange={(e) => setProfileSettings({ ...profileSettings, stats: { ...profileSettings.stats, experience: e.target.value } })}
                    placeholder="contoh: 25+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kepuasan Pasien</Label>
                  <Input
                    value={profileSettings.stats?.satisfaction || "98%"}
                    onChange={(e) => setProfileSettings({ ...profileSettings, stats: { ...profileSettings.stats, satisfaction: e.target.value } })}
                    placeholder="contoh: 98%"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Settings */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Link Eksternal & Widget</CardTitle>
              <CardDescription>Kelola link eksternal sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wistleblower System Surabaya (Link)</Label>
                  <Input
                    value={externalLinks.wbs}
                    onChange={(e) => setExternalLinks({ ...externalLinks, wbs: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lapor Warga Surabaya (Link)</Label>
                  <Input
                    value={externalLinks.lapor}
                    onChange={(e) => setExternalLinks({ ...externalLinks, lapor: e.target.value })}
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">WhatsApp Widget</Label>
                      <p className="text-sm text-muted-foreground">Tampilkan tombol floating WhatsApp di website</p>
                    </div>
                    <Switch
                      checked={externalLinks.enableWhatsapp}
                      onCheckedChange={(checked) => setExternalLinks({ ...externalLinks, enableWhatsapp: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">Chatbot AI Widget</Label>
                      <p className="text-sm text-muted-foreground">Tampilkan tombol floating Chatbot AI di website</p>
                    </div>
                    <Switch
                      checked={externalLinks.enableChatbot}
                      onCheckedChange={(checked) => setExternalLinks({ ...externalLinks, enableChatbot: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">Layanan Konsultasi Online</Label>
                      <p className="text-sm text-muted-foreground">Aktifkan/nonaktifkan layanan konsultasi online</p>
                    </div>
                    <Switch
                      checked={externalLinks.consultationEnabled ?? true}
                      onCheckedChange={(checked) => setExternalLinks({ ...externalLinks, consultationEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">Aktifkan Portal Pasien</Label>
                      <p className="text-sm text-muted-foreground">Tampilkan tombol Portal Pasien di header</p>
                    </div>
                    <Switch
                      checked={externalLinks.enablePatientPortal ?? true}
                      onCheckedChange={(checked) => setExternalLinks({ ...externalLinks, enablePatientPortal: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">Google Reviews</Label>
                      <p className="text-sm text-muted-foreground">Tampilkan ulasan Google Maps di halaman utama</p>
                    </div>
                    <Switch
                      checked={externalLinks.googleReviews?.enabled || false}
                      onCheckedChange={(checked: boolean) => setExternalLinks({
                        ...externalLinks,
                        googleReviews: { ...externalLinks.googleReviews, enabled: checked }
                      })}
                    />
                  </div>

                  {(externalLinks.googleReviews?.enabled) && (
                    <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                      <div className="space-y-2">
                        <Label>Google Place ID / Embed URL</Label>
                        <Input
                          value={externalLinks.googleReviews?.placeId || ''}
                          onChange={(e) => setExternalLinks({
                            ...externalLinks,
                            googleReviews: { ...externalLinks.googleReviews, enabled: true, placeId: e.target.value }
                          })}
                          placeholder="Place ID (ChIJ...) atau URL Widget (https://...)"
                        />
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <strong>Opsi 1 (Link):</strong> Masukkan <strong>Place ID</strong> (misal: <code>ChIJZ20ntT5ly0Rhb1FrcqMoig</code>) untuk mengarahkan link ke Google Maps asli RS.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Opsi 2 (Ulasan Asli):</strong> Untuk menampilkan daftar ulasan langsung, gunakan layanan widget seperti <strong>Trustindex</strong> atau <strong>Elfsight</strong>. Masukkan URL <code>src</code> dari kode iframe yang mereka berikan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSaveLinks} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notif Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Kelola preferensi notifikasi sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notifikasi Email</p>
                    <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notifikasi SMS</p>
                    <p className="text-sm text-muted-foreground">Terima notifikasi melalui SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keamanan</CardTitle>
              <CardDescription>Konfigurasi keamanan akses sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Autentikasi Dua Faktor (2FA) - Global</p>
                  <p className="text-sm text-muted-foreground">Wajibkan 2FA untuk semua admin yang masuk ke sistem.</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                  }
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Session Timeout (menit)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Durasi sesi sebelum logout otomatis</p>
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (hari)</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Wajib ganti password setelah</p>
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Blokir setelah percobaan gagal</p>
                </div>
              </div>
              <Button onClick={handleSaveSecurity} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings - RESTORED & IMPLEMENTED */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>Sesuaikan logo dan warna website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* LOGO UPLOAD */}
                <div className="space-y-2">
                  <Label>Logo Rumah Sakit</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      {/* Hidden Input for manual URL if needed */}
                      <Input
                        value={appearanceSettings.logoUrl}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, logoUrl: e.target.value })}
                        placeholder="URL Logo (atau upload file)"
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              toast({ description: "Mengupload logo..." });

                              // Direct Upload Logic to bypass potential api.ts cache issues
                              const formData = new FormData();
                              formData.append('file', file);
                              const token = localStorage.getItem('adminToken');

                              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                              const response = await fetch(`${apiUrl}/upload`, {
                                method: 'POST',
                                body: formData,
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                              });

                              const data = await response.json();

                              if (!data.success) throw new Error(data.message || 'Upload failed');

                              setAppearanceSettings(prev => ({ ...prev, logoUrl: data.data.url }));
                              toast({ title: "Upload Berhasil", description: "Logo berhasil diupload" });
                            } catch (err: any) {
                              console.error("Upload failed", err);
                              toast({ title: "Upload Gagal", description: err.message, variant: "destructive" });
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Disarankan format PNG transparan.</p>
                    </div>

                    {/* Preview Area */}
                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                      {appearanceSettings.logoUrl ? (
                        <img src={appearanceSettings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* FAVICON UPLOAD */}
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={appearanceSettings.faviconUrl}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, faviconUrl: e.target.value })}
                        placeholder="URL Favicon"
                        className="mb-2"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            toast({ description: "Mengupload favicon..." });

                            const formData = new FormData();
                            formData.append('file', file);
                            const token = localStorage.getItem('adminToken');

                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                            const response = await fetch(`${apiUrl}/upload`, {
                              method: 'POST',
                              body: formData,
                              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                            });

                            const data = await response.json();

                            if (!data.success) throw new Error(data.message || 'Upload failed');

                            setAppearanceSettings(prev => ({ ...prev, faviconUrl: data.data.url }));
                            toast({ title: "Upload Berhasil" });
                          } catch (err: any) {
                            console.error("Upload failed", err);
                            toast({ title: "Upload Gagal", description: err.message, variant: "destructive" });
                          }
                        }}
                      />
                    </div>
                    <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                      {appearanceSettings.faviconUrl ? (
                        <img src={appearanceSettings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                      ) : (
                        <Globe className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveAppearance} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Settings */}
        <TabsContent value="services">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standar Pelayanan</CardTitle>
                <CardDescription>Atur konten halaman standar pelayanan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Deskripsi Umum</Label>
                  <Textarea
                    value={serviceStandards.description}
                    onChange={(e) => setServiceStandards({ ...serviceStandards, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maklumat Pelayanan</Label>
                  <Textarea
                    value={serviceStandards.maklumat}
                    onChange={(e) => setServiceStandards({ ...serviceStandards, maklumat: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Janji Layanan</Label>
                  <Textarea
                    value={serviceStandards.promise}
                    onChange={(e) => setServiceStandards({ ...serviceStandards, promise: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inovasi Layanan</CardTitle>
                <CardDescription>Tambah daftar inovasi layanan RS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Add New Innovation Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label>Judul Inovasi</Label>
                    <Input
                      value={newInnovation.title}
                      onChange={(e) => setNewInnovation({ ...newInnovation, title: e.target.value })}
                      placeholder="Contoh: E-Medical Record"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Deskripsi Singkat</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newInnovation.description}
                        onChange={(e) => setNewInnovation({ ...newInnovation, description: e.target.value })}
                        placeholder="Jelaskan secara singkat inovasi ini..."
                      />
                      <Button onClick={handleAddInnovation} variant="secondary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* List of Innovations */}
                {innovations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    Belum ada inovasi yang ditambahkan.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {innovations.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="space-y-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            <ListPlus className="w-4 h-4 text-primary" />
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteInnovation(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSaveServices} disabled={updateSettingsMutation.isPending} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zona Integritas Settings */}
        <TabsContent value="zi">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Capaian Zona Integritas</CardTitle>
                <CardDescription>Atur nilai capaian SPAK, SPKP, dan SAKIP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nilai SPAK (Indeks Persepsi Anti Korupsi)</Label>
                    <Input
                      value={ziSettings.scores.spak}
                      onChange={(e) => setZISettings({
                        ...ziSettings,
                        scores: { ...ziSettings.scores, spak: e.target.value }
                      })}
                      placeholder="3.72"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai SPKP (Indeks Persepsi Kualitas Pelayanan)</Label>
                    <Input
                      value={ziSettings.scores.spkp}
                      onChange={(e) => setZISettings({
                        ...ziSettings,
                        scores: { ...ziSettings.scores, spkp: e.target.value }
                      })}
                      placeholder="3.85"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai SAKIP</Label>
                    <Input
                      value={ziSettings.scores.sakip}
                      onChange={(e) => setZISettings({
                        ...ziSettings,
                        scores: { ...ziSettings.scores, sakip: e.target.value }
                      })}
                      placeholder="A"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Indikator</CardTitle>
                <CardDescription>Atur status badge dan daftar indikator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teks Status WBK (Saat Ini)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={ziSettings.status?.wbk_text || ""}
                        onChange={(e) => setZISettings({ ...ziSettings, status: { ...ziSettings.status, wbk_text: e.target.value } })}
                        placeholder="Predikat WBK"
                      />
                      <Input
                        type="number"
                        className="w-24"
                        value={ziSettings.status?.wbk_year || ""}
                        onChange={(e) => setZISettings({ ...ziSettings, status: { ...ziSettings.status, wbk_year: parseInt(e.target.value) } })}
                        placeholder="2023"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Selanjutnya (WBBM)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={ziSettings.status?.wbbm_target_text || ""}
                        onChange={(e) => setZISettings({ ...ziSettings, status: { ...ziSettings.status, wbbm_target_text: e.target.value } })}
                        placeholder="WBBM"
                      />
                      <Input
                        type="number"
                        className="w-24"
                        value={ziSettings.status?.wbbm_target_year || ""}
                        onChange={(e) => setZISettings({ ...ziSettings, status: { ...ziSettings.status, wbbm_target_year: parseInt(e.target.value) } })}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Indikator Proses (WBK)</Label>
                    <Textarea
                      rows={6}
                      value={ziSettings.indikators?.wbk_process || ""}
                      onChange={(e) => setZISettings({ ...ziSettings, indikators: { ...ziSettings.indikators, wbk_process: e.target.value } })}
                      placeholder="Pisahkan dengan enter..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Indikator Hasil (WBK)</Label>
                    <Textarea
                      rows={6}
                      value={ziSettings.indikators?.wbk_result || ""}
                      onChange={(e) => setZISettings({ ...ziSettings, indikators: { ...ziSettings.indikators, wbk_result: e.target.value } })}
                      placeholder="Pisahkan dengan enter..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Syarat WBBM</Label>
                    <Textarea
                      rows={6}
                      value={ziSettings.indikators?.wbbm_syarat || ""}
                      onChange={(e) => setZISettings({ ...ziSettings, indikators: { ...ziSettings.indikators, wbbm_syarat: e.target.value } })}
                      placeholder="Pisahkan dengan enter..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Unggulan</CardTitle>
                <CardDescription>Edit konten 4 program unggulan Zona Integritas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ziSettings.programs?.map((program: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-lg items-center">
                    <div className="md:col-span-1 flex justify-center">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <Label>Judul</Label>
                      <Input
                        value={program.title}
                        onChange={(e) => handleProgramChange(idx, 'title', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      <Label>Deskripsi</Label>
                      <Input
                        value={program.description}
                        onChange={(e) => handleProgramChange(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Icon (Lucide)</Label>
                      <Input
                        value={program.icon}
                        onChange={(e) => handleProgramChange(idx, 'icon', e.target.value)}
                        placeholder="Star, Shield..."
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Penghargaan / Prestasi</CardTitle>
                <CardDescription>Tambah daftar prestasi WBK/WBBM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Form Add Achievement */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Input
                      type="number"
                      value={newAchievement.year}
                      onChange={(e) => setNewAchievement({ ...newAchievement, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Judul Prestasi</Label>
                    <Input
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                      placeholder="Contoh: Predikat WBK"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Deskripsi</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                        placeholder="Keterangan singkat..."
                      />
                      <Button onClick={handleAddAchievement} variant="secondary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* List Achievements */}
                {ziSettings.achievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    Belum ada prestasi yang ditambahkan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ziSettings.achievements.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                            {item.year}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => handleDeleteAchievement(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            <Button onClick={handleSaveZI} disabled={updateSettingsMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default AdminSettings;
