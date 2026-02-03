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

const AdminServices: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("OUTPATIENT");

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
          <h1 className="text-2xl font-bold">Kelola Layanan</h1>
          <p className="text-muted-foreground">Kelola layanan kesehatan rumah sakit</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* Hidden input to ensure it works if FormData expects it, though we use state */}
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari layanan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => handleToggleActive(service.id)}
                    />
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
    </div>
  );
};

export default AdminServices;
