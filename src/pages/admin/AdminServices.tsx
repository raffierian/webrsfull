import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Stethoscope,
  Building2,
  AlertCircle,
  Activity,
  FlaskConical,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { X, Check } from "lucide-react";

const iconOptions = [
  { value: 'Stethoscope', label: 'Stethoscope' },
  { value: 'Building2', label: 'Building' },
  { value: 'AlertCircle', label: 'Emergency' },
  { value: 'Activity', label: 'Activity' },
  { value: 'FlaskConical', label: 'Lab' },
  { value: 'Heart', label: 'Heart' },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Stethoscope,
    Building2,
    AlertCircle,
    Activity,
    FlaskConical,
    Heart
  };
  return icons[iconName] || Stethoscope;
};

const servicePageTypes = [
  { value: 'outpatient', label: 'Rawat Jalan' },
  { value: 'inpatient', label: 'Rawat Inap' },
  { value: 'emergency', label: 'Gawat Darurat' },
  { value: 'intensive', label: 'Intensive Care' },
  { value: 'supporting', label: 'Penunjang Medis' },
  { value: 'specialist', label: 'Klinik Spesialis' },
];

const AdminServices: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("OUTPATIENT");

  // Page Content Management State
  const [selectedPage, setSelectedPage] = useState("outpatient");
  const { settings } = useSettings();
  const [pageContent, setPageContent] = useState<any>({
    description: "",
    fullDescription: "",
    image: "",
    features: [],
    procedures: [],
    facilities: [],
    doctors: []
  });

  // Sync page content with settings when selectedPage changes or settings load
  useEffect(() => {
    if (settings && settings.service_pages && settings.service_pages[selectedPage as keyof typeof settings.service_pages]) {
      const content = settings.service_pages[selectedPage as keyof typeof settings.service_pages];
      setPageContent({
        description: content?.description || "",
        fullDescription: content?.fullDescription || "",
        image: content?.image || "",
        features: content?.features || [],
        procedures: content?.procedures || [],
        facilities: content?.facilities || [],
        doctors: content?.doctors || [],
      });
    } else {
      // Reset to empty if no content found
      setPageContent({
        description: "",
        fullDescription: "",
        image: "",
        features: [],
        procedures: [],
        facilities: [],
        doctors: []
      });
    }
  }, [selectedPage, settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Konten halaman berhasil diperbarui');
    },
    onError: (error: any) => toast.error(error.message || 'Gagal memperbarui konten')
  });

  const handleSavePageContent = () => {
    const key = `service_page_${selectedPage}`;
    updateSettingsMutation.mutate({ [key]: pageContent });
  };

  // Helper for array fields
  const addArrayItem = (field: string, item: any) => {
    setPageContent({ ...pageContent, [field]: [...pageContent[field], item] });
  };

  const removeArrayItem = (field: string, idx: number) => {
    const newArr = [...pageContent[field]];
    newArr.splice(idx, 1);
    setPageContent({ ...pageContent, [field]: newArr });
  };

  // Fetch Services

  // Fetch Services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.services.getAllAdmin(),
  });

  const services = Array.isArray(servicesData) ? servicesData : (servicesData?.data || []);

  // Update selectedType when editingService changes
  useEffect(() => {
    if (editingService) {
      setSelectedType(editingService.type || "OUTPATIENT");
    } else {
      setSelectedType("OUTPATIENT");
    }
  }, [editingService]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.services.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Layanan berhasil ditambahkan');
      setIsDialogOpen(false);
      setEditingService(null);
    },
    onError: (error: any) => toast.error(error.message || 'Gagal menambahkan layanan')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.services.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Layanan berhasil diperbarui');
      setIsDialogOpen(false);
      setEditingService(null);
    },
    onError: (error: any) => toast.error(error.message || 'Gagal memperbarui layanan')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.services.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Layanan berhasil dihapus');
    },
    onError: (error: any) => toast.error(error.message || 'Gagal menghapus layanan')
  });

  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string) => {
    const service = services.find((s: any) => s.id === id);
    if (service) {
      updateMutation.mutate({ id, data: { isActive: !service.isActive } });
    }
  };

  const handleToggleFeatured = (id: string) => {
    const service = services.find((s: any) => s.id === id);
    if (service) {
      updateMutation.mutate({ id, data: { isFeatured: !service.isFeatured } });
    }
  };

  const handleToggleBookable = (id: string) => {
    const service = services.find((s: any) => s.id === id);
    if (service) {
      const currentVal = service.isBookable !== undefined ? service.isBookable : true;
      updateMutation.mutate({ id, data: { isBookable: !currentVal } });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const facilities = (formData.get('features') as string).split('\n').filter(f => f.trim());

    // Use the state for type to be safe
    const type = selectedType;

    const payload = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: formData.get('description') as string,
      facilities, // using facilities for backend
      type, // sending type
      icon: 'Stethoscope', // Default
      imageUrl: '',
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Layanan & Halaman</h1>
          <p className="text-muted-foreground">Atur daftar layanan dan konten halaman layanan</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Daftar Layanan
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Konten Halaman
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex justify-between mb-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari layanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setEditingService(null)}>
                  <Plus className="w-4 h-4" />
                  Tambah Layanan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Existing form fields unchanged, just moved here */}
                  <div>
                    <Label htmlFor="name">Nama Layanan *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingService?.name}
                      placeholder="Nama layanan"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Tipe Layanan *</Label>
                    <Select value={selectedType} onValueChange={setSelectedType} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Pilih tipe layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OUTPATIENT">Rawat Jalan</SelectItem>
                        <SelectItem value="INPATIENT">Rawat Inap</SelectItem>
                        <SelectItem value="EMERGENCY">Gawat Darurat</SelectItem>
                        <SelectItem value="INTENSIVE">Intensive Care</SelectItem>
                        <SelectItem value="SUPPORTING">Penunjang Medis</SelectItem>
                        <SelectItem value="SPECIALIST">Klinik Spesialis</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="type" value={selectedType} />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingService?.description}
                      placeholder="Deskripsi layanan"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="features">Fitur (satu per baris)</Label>
                    <Textarea
                      id="features"
                      name="features"
                      defaultValue={editingService?.facilities?.join('\n') || editingService?.features?.join('\n')}
                      placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingService ? 'Simpan' : 'Tambah')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services Grid */}
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service: any) => {
                const Icon = getIcon(service.icon);
                return (
                  <div key={service.id} className="bg-card rounded-lg border p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2" title="Aktifkan Layanan">
                          <span className="text-xs text-muted-foreground">Aktif</span>
                          <Switch
                            checked={service.isActive}
                            onCheckedChange={() => handleToggleActive(service.id)}
                          />
                        </div>
                        <div className="flex items-center gap-2" title="Layanan Unggulan">
                          <span className="text-xs text-muted-foreground">Unggulan</span>
                          <Switch
                            checked={service.isFeatured}
                            onCheckedChange={() => handleToggleFeatured(service.id)}
                            className="data-[state=checked]:bg-yellow-500"
                          />
                        </div>
                        <div className="flex items-center gap-2" title="Tersedia untuk Booking">
                          <span className="text-xs text-muted-foreground">Booking</span>
                          <Switch
                            checked={service.isBookable !== false}
                            onCheckedChange={() => handleToggleBookable(service.id)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{service.type}</Badge>
                        <Badge variant={service.isActive ? 'default' : 'secondary'} className="text-xs">
                          {service.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(service.facilities || service.features) && (service.facilities || service.features).slice(0, 3).map((feature: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingService(service);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Konten Halaman Layanan</CardTitle>
                <CardDescription>Pilih halaman layanan yang ingin diedit kontennya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="w-full md:w-1/3">
                  <Label>Pilih Halaman</Label>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih halaman" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicePageTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Deskripsi Singkat</Label>
                    <Input
                      value={pageContent.description}
                      onChange={(e) => setPageContent({ ...pageContent, description: e.target.value })}
                      placeholder="Deskripsi singkat yang muncul di kartu layanan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi Lengkap</Label>
                    <Textarea
                      value={pageContent.fullDescription}
                      onChange={(e) => setPageContent({ ...pageContent, fullDescription: e.target.value })}
                      placeholder="Penjelasan lengkap tentang layanan ini..."
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Gambar Utama (Hero Image)</Label>
                    <Input
                      value={pageContent.image}
                      onChange={(e) => setPageContent({ ...pageContent, image: e.target.value })}
                      placeholder="https://..."
                    />
                    {pageContent.image && (
                      <img src={pageContent.image} alt="Preview" className="h-32 object-cover rounded mt-2 border" />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Features Manager */}
                  <div className="border p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Check className="w-4 h-4" /> Keunggulan (Features)</h3>
                    <div className="flex gap-2">
                      <Input id="new-feature" placeholder="Tambah keunggulan..." onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) { addArrayItem('features', val); e.currentTarget.value = ''; }
                          e.preventDefault();
                        }
                      }} />
                      <Button size="sm" onClick={() => {
                        const el = document.getElementById('new-feature') as HTMLInputElement;
                        if (el.value.trim()) { addArrayItem('features', el.value.trim()); el.value = ''; }
                      }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <ul className="space-y-2">
                      {pageContent.features?.map((item: string, idx: number) => (
                        <li key={idx} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                          {item}
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeArrayItem('features', idx)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Procedures Manager */}
                  <div className="border p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Alur Pelayanan (Procedures)</h3>
                    <div className="flex gap-2">
                      <Input id="new-procedure" placeholder="Tambah alur..." onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) { addArrayItem('procedures', val); e.currentTarget.value = ''; }
                          e.preventDefault();
                        }
                      }} />
                      <Button size="sm" onClick={() => {
                        const el = document.getElementById('new-procedure') as HTMLInputElement;
                        if (el.value.trim()) { addArrayItem('procedures', el.value.trim()); el.value = ''; }
                      }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <ul className="space-y-2">
                      {pageContent.procedures?.map((item: string, idx: number) => (
                        <li key={idx} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                          <span className="flex gap-2"><span className="font-bold text-primary">{idx + 1}.</span> {item}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeArrayItem('procedures', idx)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Facilities Manager */}
                  <div className="border p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Fasilitas</h3>
                    <div className="flex gap-2">
                      <Input id="new-facility" placeholder="Tambah fasilitas..." onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) { addArrayItem('facilities', val); e.currentTarget.value = ''; }
                          e.preventDefault();
                        }
                      }} />
                      <Button size="sm" onClick={() => {
                        const el = document.getElementById('new-facility') as HTMLInputElement;
                        if (el.value.trim()) { addArrayItem('facilities', el.value.trim()); el.value = ''; }
                      }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <ul className="space-y-2">
                      {pageContent.facilities?.map((item: string, idx: number) => (
                        <li key={idx} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                          {item}
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeArrayItem('facilities', idx)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button onClick={handleSavePageContent} disabled={updateSettingsMutation.isPending} className="w-full">
                  {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan Konten Halaman'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default AdminServices;
