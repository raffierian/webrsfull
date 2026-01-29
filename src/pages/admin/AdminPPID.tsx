import { useState } from "react";
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
  FileText,
  Download,
  Eye,
  Upload,
  FolderOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: number;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  year: number;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: "profil", label: "Profil Rumah Sakit" },
  { value: "renstra", label: "Rencana Strategis" },
  { value: "lakip", label: "LAKIP" },
  { value: "anggaran", label: "Anggaran" },
  { value: "pengadaan", label: "Pengadaan" },
  { value: "regulasi", label: "Regulasi" },
  { value: "standar", label: "Standar Pelayanan" },
  { value: "lainnya", label: "Lainnya" },
];

const initialDocuments: Document[] = [
  {
    id: 1,
    title: "Profil RS Soewandhie 2024",
    category: "profil",
    description: "Dokumen profil lengkap rumah sakit tahun 2024",
    fileUrl: "/documents/profil-2024.pdf",
    fileSize: "2.5 MB",
    fileType: "PDF",
    year: 2024,
    isPublic: true,
    downloadCount: 156,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 2,
    title: "Rencana Strategis 2024-2028",
    category: "renstra",
    description: "Dokumen rencana strategis lima tahunan",
    fileUrl: "/documents/renstra-2024-2028.pdf",
    fileSize: "5.2 MB",
    fileType: "PDF",
    year: 2024,
    isPublic: true,
    downloadCount: 89,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: 3,
    title: "LAKIP Tahun 2023",
    category: "lakip",
    description: "Laporan Akuntabilitas Kinerja Instansi Pemerintah",
    fileUrl: "/documents/lakip-2023.pdf",
    fileSize: "8.1 MB",
    fileType: "PDF",
    year: 2023,
    isPublic: true,
    downloadCount: 234,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    id: 4,
    title: "Standar Pelayanan Minimal",
    category: "standar",
    description: "Dokumen SPM Rumah Sakit",
    fileUrl: "/documents/spm-2024.pdf",
    fileSize: "1.8 MB",
    fileType: "PDF",
    year: 2024,
    isPublic: true,
    downloadCount: 312,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
];

const AdminPPID = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    category: "profil",
    description: "",
    year: new Date().getFullYear(),
    isPublic: true,
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.category) {
      toast({ title: "Error", description: "Mohon lengkapi field wajib", variant: "destructive" });
      return;
    }

    if (selectedDocument) {
      setDocuments(prev =>
        prev.map(doc => doc.id === selectedDocument.id ? { ...doc, ...formData, updatedAt: new Date().toISOString().split("T")[0] } as Document : doc)
      );
      toast({ title: "Berhasil", description: "Dokumen telah diperbarui" });
    } else {
      const newDoc: Document = {
        id: Math.max(...documents.map(d => d.id)) + 1,
        title: formData.title!,
        category: formData.category!,
        description: formData.description || "",
        fileUrl: "/documents/new-doc.pdf",
        fileSize: "1.0 MB",
        fileType: "PDF",
        year: formData.year || new Date().getFullYear(),
        isPublic: formData.isPublic ?? true,
        downloadCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setDocuments(prev => [newDoc, ...prev]);
      toast({ title: "Berhasil", description: "Dokumen baru telah ditambahkan" });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedDocument) {
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
      setIsDeleteOpen(false);
      toast({ title: "Berhasil", description: "Dokumen telah dihapus" });
    }
  };

  const openEditForm = (doc: Document) => {
    setSelectedDocument(doc);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      year: doc.year,
      isPublic: doc.isPublic,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setSelectedDocument(null);
    setFormData({
      title: "",
      category: "profil",
      description: "",
      year: new Date().getFullYear(),
      isPublic: true,
    });
  };

  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">PPID</h1>
          <p className="text-muted-foreground">Pejabat Pengelola Informasi dan Dokumentasi</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Dokumen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-sm text-muted-foreground">Total Dokumen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{documents.filter(d => d.isPublic).length}</div>
            <p className="text-sm text-muted-foreground">Dokumen Publik</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-sm text-muted-foreground">Total Unduhan</p>
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
                placeholder="Cari dokumen..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Daftar Dokumen
          </CardTitle>
          <CardDescription>{filteredDocuments.length} dokumen ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded">{categories.find(c => c.value === doc.category)?.label}</span>
                      <span>{doc.fileType} • {doc.fileSize}</span>
                      <span>Tahun {doc.year}</span>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloadCount}</span>
                      {doc.isPublic ? (
                        <span className="text-green-600">Publik</span>
                      ) : (
                        <span className="text-yellow-600">Internal</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(doc)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => { setSelectedDocument(doc); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDocument ? "Edit Dokumen" : "Upload Dokumen Baru"}</DialogTitle>
            <DialogDescription>Lengkapi informasi dokumen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Dokumen *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul dokumen"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat dokumen"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>File Dokumen</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop atau klik untuk upload</p>
                <Button variant="outline" size="sm" className="mt-2">Pilih File</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPublic">Dokumen Publik (dapat diakses masyarakat)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{selectedDocument ? "Simpan" : "Upload"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
            <AlertDialogDescription>Dokumen "{selectedDocument?.title}" akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPPID;
