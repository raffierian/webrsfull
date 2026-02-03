import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Calendar,
  Clock,
  Star,
  Phone,
  Mail,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const departments = ['Semua', 'Kardiologi', 'Pediatri', 'Bedah Umum', 'Obstetri & Ginekologi', 'Penyakit Dalam', 'Umum', 'Saraf', 'Mata', 'THT'];

const AdminDoctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch doctors
  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: api.doctors.getAllAdmin,
  });

  const doctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.data || []);

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.doctors.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Data dokter berhasil ditambahkan');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan dokter');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.doctors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Data dokter berhasil diperbarui');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui dokter');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.doctors.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Data dokter berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus dokter');
    }
  });

  const importMutation = useMutation({
    mutationFn: api.doctors.import,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success(data.message || 'Data dokter berhasil diimport');
      setIsImportOpen(false);
      setImportFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal mengimport data dokter');
    }
  });

  // Derived state
  const filteredDoctors = doctors.filter((doctor: any) => {
    const matchSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDepartment = departmentFilter === 'Semua' || (doctor.specialization && doctor.specialization.includes(departmentFilter));
    // Status filter: logic can be refined. Assuming 'active' checks isActive.
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? doctor.isActive : !doctor.isActive);
    return matchSearch && matchDepartment && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleAvailability = (doctor: any) => {
    updateMutation.mutate({
      id: doctor.id,
      data: { isAvailable: !doctor.isAvailable }
    });
  };

  const handleToggleEmployeeStatus = (doctor: any) => {
    updateMutation.mutate({
      id: doctor.id,
      data: { isActive: !doctor.isActive }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const doctorData = {
      name: formData.get('name') as string,
      specialization: formData.get('specialty') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      education: formData.get('education') as string,
      experienceYears: parseInt(formData.get('experienceYears') as string) || 0,
      consultationFee: parseFloat(formData.get('consultationFee') as string) || 0,
      photoUrl: formData.get('photoUrl') as string,
      bio: formData.get('bio') as string,
      schedule: formData.get('schedule') as string,
      // Default / Hidden fields
      department: 'Umum',
      isActive: editingDoctor ? editingDoctor.isActive : true,
      isAvailable: editingDoctor ? editingDoctor.isAvailable : true,
    };

    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data: doctorData });
    } else {
      createMutation.mutate(doctorData);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading data...</div>;
  }

  // Get dynamic departments from data
  const dynamicDepartments = Array.from(new Set(doctors.map((d: any) => d.specialization).filter(Boolean))).sort() as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Dokter</h1>
          <p className="text-muted-foreground">Kelola data dokter, status kepegawaian, dan jadwal praktik</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10" onClick={() => setIsImportOpen(true)}>
            <FileSpreadsheet className="w-4 h-4" />
            Import Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingDoctor(null)}>
                <Plus className="w-4 h-4" />
                Tambah Dokter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingDoctor ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingDoctor?.name}
                      placeholder="Dr. Nama Lengkap, Sp.XX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Spesialisasi *</Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      defaultValue={editingDoctor?.specialization}
                      placeholder="Spesialis Jantung"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">SIP (Nomor Izin) *</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      defaultValue={editingDoctor?.licenseNumber}
                      placeholder="123/SIP/2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Pendidikan Terakhir</Label>
                    <Input
                      id="education"
                      name="education"
                      defaultValue={editingDoctor?.education}
                      placeholder="S3 Kedokteran UI"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">Pengalaman (Tahun)</Label>
                    <Input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      defaultValue={editingDoctor?.experienceYears}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultationFee">Biaya Konsultasi (Rp)</Label>
                    <Input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      defaultValue={editingDoctor?.consultationFee}
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photoUrl">Foto URL</Label>
                    <Input
                      id="photoUrl"
                      name="photoUrl"
                      defaultValue={editingDoctor?.photoUrl}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="bio">Bio / Deskripsi Singkat</Label>
                    <Input
                      id="bio"
                      name="bio"
                      defaultValue={editingDoctor?.bio}
                      placeholder="Dokter spesialis berpengalaman..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="schedule">Jadwal Praktik (Info Teks) *</Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      defaultValue={editingDoctor?.schedule}
                      placeholder="Senin - Jumat | 08:00 - 14:00"
                      required
                    />
                  </div>
                  {/* Department is optional/deprecated in favor of specialization, keeping as hidden or removed? keeping as hidden default */}
                  <input type="hidden" name="department" value="Umum" />
                </div>


                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingDoctor ? 'Simpan' : 'Tambah')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Pilih Spesialisasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Spesialisasi</SelectItem>
            {dynamicDepartments.map((dept: any) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status Pegawai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{doctors.length}</div>
          <div className="text-sm text-muted-foreground">Total Dokter</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {doctors.filter((d: any) => d.isActive).length}
          </div>
          <div className="text-sm text-muted-foreground">Pegawai Aktif</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {doctors.filter((d: any) => d.isAvailable).length}
          </div>
          <div className="text-sm text-muted-foreground">Buka Praktik</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {(doctors.reduce((sum: number, d: any) => sum + Number(d.rating || 0), 0) / (doctors.length || 1)).toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Rating Rata-rata</div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor: any) => (
          <div key={doctor.id} className="bg-card rounded-lg border overflow-hidden transition-colors hover:bg-muted/30">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={doctor.photoUrl || 'https://via.placeholder.com/150'}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate" title={doctor.name}>{doctor.name}</h3>
                      <p className="text-sm text-primary truncate">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Status Switches */}
                  <div className="flex flex-col gap-2 mt-3 p-2 bg-muted/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${doctor.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {doctor.isActive ? 'Pegawai Aktif' : 'Pegawai Nonaktif'}
                      </span>
                      <Switch
                        checked={doctor.isActive ?? true}
                        onCheckedChange={() => handleToggleEmployeeStatus(doctor)}
                        className="scale-75 origin-right"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 border-dashed border-gray-200">
                      <span className={`text-xs font-medium ${doctor.isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                        {doctor.isAvailable ? 'Buka Praktik' : 'Tutup Praktik'}
                      </span>
                      <Switch
                        checked={doctor.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(doctor)}
                        disabled={!doctor.isActive} // Disable if employee is inactive
                        className="scale-75 origin-right"
                      />
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Senin - Jumat | 08:00 - 15:00
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  -
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {Number(doctor.rating || 0).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    0 pasien
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-muted/50 flex justify-end gap-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingDoctor(doctor);
                  setIsDialogOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doctor.id)}
              >
                <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data Dokter</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{importFile ? importFile.name : "Pilih file Excel atau CSV"}</p>
                <p className="text-xs text-muted-foreground">Maksimal ukuran file 10MB (.xlsx, .xls, .csv)</p>
              </div>
              <Input
                type="file"
                className="hidden"
                id="excel-upload"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="excel-upload" className="cursor-pointer">
                  Pilih File
                </label>
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
              <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Belum punya template?</p>
                <p className="text-xs text-blue-700">Gunakan template resmi kami agar format data sesuai.</p>
                <Button variant="link" className="p-0 h-auto text-xs text-blue-600 font-bold" onClick={() => {
                  const csvContent = "Nama,Spesialisasi,SIP,Pendidikan,Pengalaman,Biaya,Bio,Foto_URL\nDr. Andi,Spesialis Jantung,SIP123,UI,10,250000,Ahli jantung senior,\n";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'template_import_dokter.csv';
                  a.click();
                }}>
                  Download Template CSV
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsImportOpen(false);
              setImportFile(null);
            }}>
              Batal
            </Button>
            <Button
              onClick={() => importFile && importMutation.mutate(importFile)}
              disabled={!importFile || importMutation.isPending}
            >
              {importMutation.isPending ? 'Mengimport...' : 'Mulai Import'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
