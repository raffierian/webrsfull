import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Smartphone
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
    phone: "(031) 3717141",
    whatsapp: "6281234567890",
    address: "Jl. Tambak Rejo No.45-47, Simokerto, Surabaya",
    website: "https://rs-soewandhie.surabaya.go.id",
    description: "Rumah Sakit Umum Daerah dr. Mohamad Soewandhie adalah rumah sakit milik Pemerintah Kota Surabaya.",
    emergencyPhone: "",
    operatingHours: "",
  };

  const defaultProfileSettings = {
    vision: "Menjadi rumah sakit terpercaya pilihan masyarakat.",
    mission: "1. Memberikan pelayanan kesehatan yang bermutu.\n2. Mengembangkan SDM yang profesional.\n3. Menyediakan fasilitas modern.",
    moto: "Kesembuhan Anda adalah Kebahagiaan Kami",
    maklumat: "Kami berjanji dan sanggup melaksanakan pelayanan sesuai dengan standar pelayanan.",
    about: "Selama lebih dari 25 tahun, RS Harapan Sehat telah menjadi pilihan utama masyarakat dalam mendapatkan pelayanan kesehatan berkualitas. Dengan tenaga medis profesional dan fasilitas modern, kami berkomitmen untuk memberikan pelayanan terbaik.",
    history: "RS Harapan Sehat didirikan pada tahun 1999 dengan visi untuk memberikan pelayanan kesehatan yang terjangkau dan berkualitas bagi masyarakat Surabaya.",
    values: "Profesionalisme, Integritas, Empati, dan Inovasi.",
  };

  const defaultExternalLinks = {
    zonaIntegritas: "",
    wbs: "",
    lapor: "",
    enableChatbot: true,
    enableWhatsapp: true,
    consultationEnabled: true,
    enablePatientPortal: true,
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

  const [hospitalSettings, setHospitalSettings] = useState(defaultHospitalSettings);
  const [profileSettings, setProfileSettings] = useState(defaultProfileSettings);
  const [externalLinks, setExternalLinks] = useState(defaultExternalLinks);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [appearanceSettings, setAppearanceSettings] = useState(defaultAppearanceSettings);



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
                  <Label>Email</Label>
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
                      placeholder="(031) 372XXXX"
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
      </Tabs>
    </div>
  );
};

export default AdminSettings;
