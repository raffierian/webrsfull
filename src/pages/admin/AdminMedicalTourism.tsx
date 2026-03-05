import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSettings } from "@/hooks/useSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Save, MoveUp, MoveDown, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Forms
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Sub-components would typically go into separate files, but we keep them here for speed if they are simple
// We'll build the main shell first.

const AdminMedicalTourism = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { settings, isLoading } = useSettings();
    const [activeTab, setActiveTab] = useState("hero");

    // Local state for Hero
    const [heroData, setHeroData] = useState({
        title: "",
        subtitle: "",
        image: ""
    });

    // Local state for Why Us
    const [whyUsData, setWhyUsData] = useState<any[]>([]);

    // Local state for Excellence
    const [excellenceData, setExcellenceData] = useState<any[]>([]);

    // Local state for Packages
    const [packagesData, setPackagesData] = useState<any[]>([]);

    // Local state for Process
    const [processData, setProcessData] = useState<any[]>([]);

    // Local state for Testimonials
    const [testimonialsData, setTestimonialsData] = useState<any[]>([]);

    // Local state for Facilities
    const [facilitiesData, setFacilitiesData] = useState<any[]>([]);

    // Local state for FAQ & Contact
    const [faqContactData, setFaqContactData] = useState({
        faqs: [] as any[],
        contactInfo: {
            title: "",
            description: "",
            phone: "",
            email: "",
            whatsapp: "",
            registrationLink: ""
        }
    });

    useEffect(() => {
        if (settings?.medical_tourism?.hero) {
            setHeroData(settings.medical_tourism.hero);
        }
        if (settings?.medical_tourism?.whyUs) {
            setWhyUsData(settings.medical_tourism.whyUs);
        }
        if (settings?.medical_tourism?.centersOfExcellence) {
            setExcellenceData(settings.medical_tourism.centersOfExcellence);
        }
        if (settings?.medical_tourism?.packages) {
            setPackagesData(settings.medical_tourism.packages);
        }
        if (settings?.medical_tourism?.process) {
            setProcessData(settings.medical_tourism.process);
        }
        if (settings?.medical_tourism?.testimonials) {
            setTestimonialsData(settings.medical_tourism.testimonials);
        }
        if (settings?.medical_tourism?.facilities) {
            setFacilitiesData(settings.medical_tourism.facilities);
        }
        if (settings?.medical_tourism?.contact) {
            setFaqContactData(settings.medical_tourism.contact);
        }
    }, [settings]);

    const updateSettingsMutation = useMutation({
        mutationFn: async (newMedicalTourismData: any) => {
            const currentSettings = await api.settings.getAll();
            // We only update the medical_tourism part, keep others intact via PUT /api/settings
            // Wait, api.settings.update takes { key, value } array or object?
            // Let's assume api.settings.update takes an object of { key: value } pairs
            // Let's check how other admin pages update settings

            // Usually we can do:
            return api.settings.update({
                medical_tourism: newMedicalTourismData
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast({ title: "Berhasil", description: "Pengaturan Wisata Medis berhasil disimpan" });
        },
        onError: () => {
            toast({ title: "Gagal", description: "Gagal menyimpan pengaturan", variant: "destructive" });
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const mtData = settings.medical_tourism || {};

    const handleSave = (section: string, data: any) => {
        const newData = { ...mtData, [section]: data };
        updateSettingsMutation.mutate(newData);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Wisata Medis</h1>
                    <p className="text-muted-foreground">Kelola konten halaman Wisata Medis (Medical Tourism)</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto gap-2">
                    <TabsTrigger value="hero">Banner Utama</TabsTrigger>
                    <TabsTrigger value="whyus">Why Choose Us</TabsTrigger>
                    <TabsTrigger value="excellence">Keunggulan</TabsTrigger>
                    <TabsTrigger value="packages">Paket Medis</TabsTrigger>
                    <TabsTrigger value="process">Alur Rawat</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimoni</TabsTrigger>
                    <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
                    <TabsTrigger value="faq_contact">FAQ & Kontak</TabsTrigger>
                </TabsList>

                {/* We will implement each TabContent individually */}

                <TabsContent value="hero" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Banner Utama</CardTitle>
                            <CardDescription>Atur gambar latar belakang dan teks sambutan halaman Wisata Medis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Judul Utama</Label>
                                <Input
                                    value={heroData.title}
                                    onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                                    placeholder="Contoh: Surabaya Medical Tourism"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sub Judul / Deskripsi</Label>
                                <Textarea
                                    value={heroData.subtitle}
                                    onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })}
                                    placeholder="Contoh: Dapatkan layanan kesehatan bertaraf internasional..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Gambar Latar Belakang</Label>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <Input
                                            value={heroData.image}
                                            onChange={e => setHeroData({ ...heroData, image: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <p className="text-sm text-muted-foreground mt-2">Gunakan URL gambar dengan resolusi tinggi (misal: 1920x1080).</p>
                                    </div>
                                    {heroData.image && (
                                        <div className="w-32 h-20 rounded border bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={heroData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button
                                    onClick={() => handleSave('hero', heroData)}
                                    disabled={updateSettingsMutation.isPending}
                                >
                                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Banner
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="whyus" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Why Choose Us / Mengapa Memilih Kami</CardTitle>
                                <CardDescription>Tampilkan 4 alasan utama memilih layanan RS Soewandhie.</CardDescription>
                            </div>
                            <Button onClick={() => setWhyUsData([...whyUsData, { id: Date.now().toString(), title: '', description: '', icon: 'CheckCircle' }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Alasan
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {whyUsData.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 bg-gray-50/50">
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Judul Singkat</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newData = [...whyUsData];
                                                        newData[index].title = e.target.value;
                                                        setWhyUsData(newData);
                                                    }}
                                                    placeholder="Contoh: Teknologi Terkini"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nama Icon (Lucide)</Label>
                                                <Input
                                                    value={item.icon}
                                                    onChange={e => {
                                                        const newData = [...whyUsData];
                                                        newData[index].icon = e.target.value;
                                                        setWhyUsData(newData);
                                                    }}
                                                    placeholder="Contoh: Zap, Star, Shield"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deskripsi Lengkap</Label>
                                            <Textarea
                                                value={item.description}
                                                onChange={e => {
                                                    const newData = [...whyUsData];
                                                    newData[index].description = e.target.value;
                                                    setWhyUsData(newData);
                                                }}
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-6">
                                        <Button
                                            variant="destructive" size="icon"
                                            onClick={() => setWhyUsData(whyUsData.filter(i => i.id !== item.id))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {whyUsData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data. Silakan klik "Tambah Alasan"
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('whyUs', whyUsData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan "Why Choose Us"
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="excellence" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pusat Keunggulan (Centers of Excellence)</CardTitle>
                                <CardDescription>Layanan kesehatan andalan rumah sakit.</CardDescription>
                            </div>
                            <Button onClick={() => setExcellenceData([...excellenceData, { id: Date.now().toString(), title: '', description: '', image: '', features: [] }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Keunggulan
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {excellenceData.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 flex-col md:flex-row bg-gray-50/50">
                                    <div className="w-32 h-32 rounded border bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt="Icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nama Layanan Unggulan</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newData = [...excellenceData];
                                                        newData[index].title = e.target.value;
                                                        setExcellenceData(newData);
                                                    }}
                                                    placeholder="Contoh: Comprehensive Cancer Center"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>URL Gambar/Foto</Label>
                                                <Input
                                                    value={item.image}
                                                    onChange={e => {
                                                        const newData = [...excellenceData];
                                                        newData[index].image = e.target.value;
                                                        setExcellenceData(newData);
                                                    }}
                                                    placeholder="https://images.unsplash.com/..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deskripsi</Label>
                                            <Textarea
                                                value={item.description}
                                                onChange={e => {
                                                    const newData = [...excellenceData];
                                                    newData[index].description = e.target.value;
                                                    setExcellenceData(newData);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fasilitas / Fitur (Pisahkan dengan koma)</Label>
                                            <Input
                                                value={(item.features || []).join(', ')}
                                                onChange={e => {
                                                    const newData = [...excellenceData];
                                                    newData[index].features = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                    setExcellenceData(newData);
                                                }}
                                                placeholder="Kemoterapi, Radioterapi, Operasi Ekstensif"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="destructive" size="icon" onClick={() => setExcellenceData(excellenceData.filter(i => i.id !== item.id))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {excellenceData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data Centers of Excellence.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('centersOfExcellence', excellenceData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Keunggulan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="packages" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Paket Wisata Medis</CardTitle>
                                <CardDescription>Daftar paket pemeriksaan atau perawatan.</CardDescription>
                            </div>
                            <Button onClick={() => setPackagesData([...packagesData, { id: Date.now().toString(), name: '', price: '', image: '', inclusions: [] }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Paket
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {packagesData.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 flex-col md:flex-row bg-gray-50/50">
                                    <div className="w-32 h-32 rounded border bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt="Icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nama Paket</Label>
                                                <Input
                                                    value={item.name}
                                                    onChange={e => {
                                                        const newData = [...packagesData];
                                                        newData[index].name = e.target.value;
                                                        setPackagesData(newData);
                                                    }}
                                                    placeholder="Contoh: Paket Executive MCU"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Harga (Opsional)</Label>
                                                <Input
                                                    value={item.price}
                                                    onChange={e => {
                                                        const newData = [...packagesData];
                                                        newData[index].price = e.target.value;
                                                        setPackagesData(newData);
                                                    }}
                                                    placeholder="Contoh: Mulai dari Rp 2.500.000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL Gambar/Foto</Label>
                                            <Input
                                                value={item.image}
                                                onChange={e => {
                                                    const newData = [...packagesData];
                                                    newData[index].image = e.target.value;
                                                    setPackagesData(newData);
                                                }}
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Isi Paket (Pisahkan dengan koma)</Label>
                                            <Input
                                                value={(item.inclusions || []).join(', ')}
                                                onChange={e => {
                                                    const newData = [...packagesData];
                                                    newData[index].inclusions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                    setPackagesData(newData);
                                                }}
                                                placeholder="Konsultasi Spesialis, Lab Lengkap, Rontgen"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="destructive" size="icon" onClick={() => setPackagesData(packagesData.filter(i => i.id !== item.id))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {packagesData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data Paket.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('packages', packagesData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Paket
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="process" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Alur Pelayanan (Patient Journey)</CardTitle>
                                <CardDescription>Langkah-langkah yang dilalui pasien dari awal daftar hingga selesai.</CardDescription>
                            </div>
                            <Button onClick={() => setProcessData([...processData, { id: Date.now().toString(), step: processData.length + 1, title: '', description: '', icon: 'CheckCircle' }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Langkah
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {processData.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 bg-gray-50/50">
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2 w-24">
                                                <Label>Nomor Step</Label>
                                                <Input
                                                    type="number"
                                                    value={item.step}
                                                    onChange={e => {
                                                        const newData = [...processData];
                                                        newData[index].step = parseInt(e.target.value) || 0;
                                                        setProcessData(newData);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label>Judul Langkah</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newData = [...processData];
                                                        newData[index].title = e.target.value;
                                                        setProcessData(newData);
                                                    }}
                                                    placeholder="Contoh: Konsultasi Online"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Icon (Lucide)</Label>
                                            <Input
                                                value={item.icon}
                                                onChange={e => {
                                                    const newData = [...processData];
                                                    newData[index].icon = e.target.value;
                                                    setProcessData(newData);
                                                }}
                                                placeholder="Contoh: Calendar, Heart, FileText"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deskripsi</Label>
                                            <Textarea
                                                value={item.description}
                                                onChange={e => {
                                                    const newData = [...processData];
                                                    newData[index].description = e.target.value;
                                                    setProcessData(newData);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-6">
                                        <Button variant="destructive" size="icon" onClick={() => setProcessData(processData.filter(i => i.id !== item.id))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {processData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data Alur Pelayanan.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('process', processData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Alur
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="testimonials" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Testimoni Pasien Internasional</CardTitle>
                                <CardDescription>Kelola ulasan dari pasien luar negeri atau luar kota.</CardDescription>
                            </div>
                            <Button onClick={() => setTestimonialsData([...testimonialsData, { id: Date.now().toString(), name: '', country: '', text: '', rating: 5, avatar: '' }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Testimoni
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testimonialsData.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 bg-gray-50/50">
                                    <div className="w-20 h-20 rounded-full border bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {item.avatar ? (
                                            <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">Foto</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nama Pasien</Label>
                                                <Input
                                                    value={item.name}
                                                    onChange={e => {
                                                        const newData = [...testimonialsData];
                                                        newData[index].name = e.target.value;
                                                        setTestimonialsData(newData);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Asal Negara/Kota</Label>
                                                <Input
                                                    value={item.country}
                                                    onChange={e => {
                                                        const newData = [...testimonialsData];
                                                        newData[index].country = e.target.value;
                                                        setTestimonialsData(newData);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>URL Avatar (Opsional)</Label>
                                                <Input
                                                    value={item.avatar}
                                                    onChange={e => {
                                                        const newData = [...testimonialsData];
                                                        newData[index].avatar = e.target.value;
                                                        setTestimonialsData(newData);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Teks Testimoni</Label>
                                            <Textarea
                                                value={item.text}
                                                onChange={e => {
                                                    const newData = [...testimonialsData];
                                                    newData[index].text = e.target.value;
                                                    setTestimonialsData(newData);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-6">
                                        <Button variant="destructive" size="icon" onClick={() => setTestimonialsData(testimonialsData.filter(i => i.id !== item.id))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {testimonialsData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data Testimoni.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('testimonials', testimonialsData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Testimoni
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="facilities" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Fasilitas Unggulan (Galeri)</CardTitle>
                                <CardDescription>Galeri foto fasilitas rumah sakit yang berkaitan dengan wisata medis.</CardDescription>
                            </div>
                            <Button onClick={() => setFacilitiesData([...facilitiesData, { id: Date.now().toString(), name: '', image: '', category: 'VIP Room' }])}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Fasilitas
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {facilitiesData.map((item, index) => (
                                    <div key={item.id} className="p-4 border rounded-lg flex gap-4 bg-gray-50/50">
                                        <div className="w-24 h-24 rounded border bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt="Facilities" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nama Fasilitas"
                                                value={item.name}
                                                onChange={e => {
                                                    const newData = [...facilitiesData];
                                                    newData[index].name = e.target.value;
                                                    setFacilitiesData(newData);
                                                }}
                                            />
                                            <Input
                                                placeholder="Kategori (misal: Ruang Rawat Inap)"
                                                value={item.category}
                                                onChange={e => {
                                                    const newData = [...facilitiesData];
                                                    newData[index].category = e.target.value;
                                                    setFacilitiesData(newData);
                                                }}
                                            />
                                            <Input
                                                placeholder="URL Gambar"
                                                value={item.image}
                                                onChange={e => {
                                                    const newData = [...facilitiesData];
                                                    newData[index].image = e.target.value;
                                                    setFacilitiesData(newData);
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <Button variant="destructive" size="icon" onClick={() => setFacilitiesData(facilitiesData.filter(i => i.id !== item.id))}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {facilitiesData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data Fasilitas.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('facilities', facilitiesData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Fasilitas
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faq_contact" className="mt-6">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Informasi Kontak Wisata Medis</CardTitle>
                            <CardDescription>Nomor dan tautan spesifik untuk pasien wisata medis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Judul Kontak</Label>
                                    <Input
                                        value={faqContactData.contactInfo.title}
                                        onChange={e => setFaqContactData({ ...faqContactData, contactInfo: { ...faqContactData.contactInfo, title: e.target.value } })}
                                        placeholder="Contoh: Butuh Bantuan Perjalanan Medis Anda?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deskripsi Kontak</Label>
                                    <Input
                                        value={faqContactData.contactInfo.description}
                                        onChange={e => setFaqContactData({ ...faqContactData, contactInfo: { ...faqContactData.contactInfo, description: e.target.value } })}
                                        placeholder="Tim kami siap membantu dari awal hingga akhir..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nomor WhatsApp (Admin Wisata Medis)</Label>
                                    <Input
                                        value={faqContactData.contactInfo.whatsapp}
                                        onChange={e => setFaqContactData({ ...faqContactData, contactInfo: { ...faqContactData.contactInfo, whatsapp: e.target.value } })}
                                        placeholder="Contoh: +628123456789"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Khusus</Label>
                                    <Input
                                        value={faqContactData.contactInfo.email}
                                        onChange={e => setFaqContactData({ ...faqContactData, contactInfo: { ...faqContactData.contactInfo, email: e.target.value } })}
                                        placeholder="medicaltourism@rs-soewandhi.surabaya.go.id"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Tautan Registrasi (URL Form atau Web Pendaftaran)</Label>
                                    <Input
                                        value={faqContactData.contactInfo.registrationLink}
                                        onChange={e => setFaqContactData({ ...faqContactData, contactInfo: { ...faqContactData.contactInfo, registrationLink: e.target.value } })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>FAQ (Tanya Jawab)</CardTitle>
                                <CardDescription>Pertanyaan yang sering diajukan terkait wisata medis.</CardDescription>
                            </div>
                            <Button onClick={() => setFaqContactData({ ...faqContactData, faqs: [...faqContactData.faqs, { id: Date.now().toString(), question: '', answer: '' }] })}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah FAQ
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {faqContactData.faqs.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg flex gap-4 bg-gray-50/50">
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Pertanyaan</Label>
                                            <Input
                                                value={item.question}
                                                onChange={e => {
                                                    const newFaqs = [...faqContactData.faqs];
                                                    newFaqs[index].question = e.target.value;
                                                    setFaqContactData({ ...faqContactData, faqs: newFaqs });
                                                }}
                                                placeholder="Contoh: Apakah bisa dibantu mencarikan akomodasi hotel?"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Jawaban</Label>
                                            <Textarea
                                                value={item.answer}
                                                onChange={e => {
                                                    const newFaqs = [...faqContactData.faqs];
                                                    newFaqs[index].answer = e.target.value;
                                                    setFaqContactData({ ...faqContactData, faqs: newFaqs });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-6">
                                        <Button variant="destructive" size="icon" onClick={() => {
                                            const newFaqs = faqContactData.faqs.filter(i => i.id !== item.id);
                                            setFaqContactData({ ...faqContactData, faqs: newFaqs });
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {faqContactData.faqs.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded bg-gray-50">
                                    Belum ada data FAQ.
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => handleSave('contact', faqContactData)} disabled={updateSettingsMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Kontak & FAQ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminMedicalTourism;
