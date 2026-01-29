import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  Users,
  MapPin,
  Clock,
  Download,
  Link as LinkIcon,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

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
  isActive: boolean;
  createdAt: string;
}

const AdminTraining = () => {
  const { toast } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [formData, setFormData] = useState<Partial<Training>>({
    title: "",
    slug: "",
    description: "",
    trainer: "",
    location: "",
    startDate: "",
    endDate: "",
    maxParticipants: 30,
    fee: 0,
    lmsUrl: "",
    registrationUrl: "",
    skp: 0,
    jp: 0,
    certificateInfo: "Sertifikat Resmi Kemkes dengan SKP & JP",
    isActive: true,
  });

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const data = await api.trainings.getAllAdmin();
      setTrainings(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Gagal mengambil data pelatihan", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainings = trainings.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate) {
      toast({ title: "Error", description: "Mohon lengkapi field wajib", variant: "destructive" });
      return;
    }

    // Generate slug if empty
    if (!formData.slug) {
      formData.slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    try {
      if (selectedTraining) {
        await api.trainings.update(selectedTraining.id, formData);
        toast({ title: "Berhasil", description: "Pelatihan telah diperbarui" });
      } else {
        await api.trainings.create(formData);
        toast({ title: "Berhasil", description: "Pelatihan baru telah ditambahkan" });
      }
      setIsFormOpen(false);
      fetchTrainings();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal menyimpan pelatihan", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (selectedTraining) {
      try {
        await api.trainings.delete(selectedTraining.id);
        setIsDeleteOpen(false);
        fetchTrainings();
        toast({ title: "Berhasil", description: "Pelatihan telah dihapus" });
      } catch (error: any) {
        toast({ title: "Error", description: "Gagal menghapus pelatihan", variant: "destructive" });
      }
    }
  };

  const openEditForm = (training: Training) => {
    setSelectedTraining(training);
    setFormData({
      ...training,
      startDate: training.startDate.split('T')[0],
      endDate: training.endDate.split('T')[0],
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setSelectedTraining(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      trainer: "",
      location: "",
      startDate: "",
      endDate: "",
      maxParticipants: 30,
      fee: 0,
      lmsUrl: "",
      registrationUrl: "",
      skp: 0,
      jp: 0,
      certificateInfo: "Sertifikat Resmi Kemkes dengan SKP & JP",
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Diklat & Pelatihan</h1>
          <p className="text-muted-foreground">Kelola jadwal pelatihan dan peserta terintegrasi LMS Kemkes</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pelatihan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{trainings.length}</div>
            <p className="text-sm text-muted-foreground">Total Pelatihan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{trainings.filter(t => t.isActive).length}</div>
            <p className="text-sm text-muted-foreground">Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{trainings.reduce((sum, t) => sum + t.registeredCount, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Peserta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {trainings.reduce((sum, t) => sum + (t.skp || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total SKP</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelatihan..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Daftar Pelatihan
          </CardTitle>
          <CardDescription>{filteredTrainings.length} pelatihan ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : filteredTrainings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada pelatihan</div>
            ) : (
              filteredTrainings.map((training) => (
                <div key={training.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${training.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {training.isActive ? "Aktif" : "Non-aktif"}
                        </span>
                        {training.skp && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded font-medium">
                            {training.skp} SKP
                          </span>
                        )}
                        {training.jp && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                            {training.jp} JP
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{training.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{training.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(training.startDate).toLocaleDateString("id-ID")}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {training.location || "Online"}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {training.registeredCount}/{training.maxParticipants}</span>
                        {training.lmsUrl && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <LinkIcon className="w-4 h-4" /> LMS Terhubung
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(training)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => { setSelectedTraining(training); setIsDeleteOpen(true); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTraining ? "Edit Pelatihan" : "Tambah Pelatihan Baru"}</DialogTitle>
            <DialogDescription>Konfigurasi detail pelatihan dan integrasi LMS Kemkes</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Dasar Informasi */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Informasi Dasar</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Judul Pelatihan *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Pelatihan Clinical Pathway" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Slug (Otomatis jika kosong)</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="Contoh: pelatihan-clinical-pathway" />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Mulai *</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai *</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Contoh: Aula Lt.3 / Zoom Meeting" />
                </div>
                <div className="space-y-2">
                  <Label>Instruktur / Narasumber</Label>
                  <Input value={formData.trainer || ""} onChange={(e) => setFormData({ ...formData, trainer: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Kapasitas Peserta</Label>
                  <Input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Biaya (Kosongkan jika gratis)</Label>
                  <Input type="number" value={formData.fee || 0} onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
              </div>
            </div>

            {/* Integrasi LMS & Sertifikasi */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                LMS Kemkes & Sertifikasi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jumlah SKP</Label>
                  <Input type="number" value={formData.skp || 0} onChange={(e) => setFormData({ ...formData, skp: parseInt(e.target.value) })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah JP (Jam Pelajaran)</Label>
                  <Input type="number" value={formData.jp || 0} onChange={(e) => setFormData({ ...formData, jp: parseInt(e.target.value) })} placeholder="0" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Informasi Sertifikat</Label>
                  <Input value={formData.certificateInfo || ""} onChange={(e) => setFormData({ ...formData, certificateInfo: e.target.value })} placeholder="Contoh: Sertifikat Kemenkes RI" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-primary flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Link LMS Kemkes
                  </Label>
                  <Input value={formData.lmsUrl || ""} onChange={(e) => setFormData({ ...formData, lmsUrl: e.target.value })} placeholder="https://lms.kemkes.go.id/pelatihan/..." />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Link Pendaftaran Eksternal (Opsional)</Label>
                  <Input value={formData.registrationUrl || ""} onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })} placeholder="https://bit.ly/daftar-diklat" />
                </div>
                <div className="flex items-center gap-2 py-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">Program Aktif (Tampilkan di Website)</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{selectedTraining ? "Simpan Perubahan" : "Terbitkan Pelatihan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelatihan?</AlertDialogTitle>
            <AlertDialogDescription>Pelatihan "{selectedTraining?.title}" akan dihapus permanen dari sistem.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTraining;
