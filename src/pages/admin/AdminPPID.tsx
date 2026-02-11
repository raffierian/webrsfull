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
  FolderOpen,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

interface Document {
  id: string; // Changed to string (UUID)
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  fileSize: number; // Changed to number
  fileType: string;
  isPublic: boolean;
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
  { value: "sakip", label: "Dokumen SAKIP" },
  { value: "zona_integritas", label: "Zona Integritas" },
  { value: "lainnya", label: "Lainnya" },
];

const AdminPPID = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    category: "profil",
    description: "",
    isPublic: true,
  });

  // Fetch Documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['ppid-documents'],
    queryFn: () => api.ppid.getAll(),
  });

  // Upload Mutation
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload(formData);
    }
  });

  // Create/Update Mutation
  const saveDocumentMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedDocument) {
        return api.ppid.update(selectedDocument.id, data);
      } else {
        return api.ppid.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppid-documents'] });
      toast({ title: "Berhasil", description: `Dokumen berhasil ${selectedDocument ? 'diperbarui' : 'ditambahkan'}` });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Gagal", description: error.message || "Terjadi kesalahan", variant: "destructive" });
    }
  });

  // Delete Mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => api.ppid.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ppid-documents'] });
      toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
      setIsDeleteOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  });

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) {
      toast({ title: "Error", description: "Mohon lengkapi field wajib", variant: "destructive" });
      return;
    }

    try {
      let fileData = {
        fileUrl: formData.fileUrl,
        fileSize: formData.fileSize,
        fileType: formData.fileType
      };

      if (uploadFile) {
        setIsUploading(true);
        const uploadRes = await uploadFileMutation.mutateAsync(uploadFile);
        // Map upload response to schema fields
        fileData = {
          fileUrl: uploadRes.url,
          fileSize: uploadRes.size, // in bytes
          fileType: uploadRes.mimetype?.split('/')[1]?.toUpperCase() || 'FILE'
        };
        setIsUploading(false);
      } else if (!selectedDocument && !uploadFile) {
        toast({ title: "Error", description: "Wajib upload file untuk dokumen baru", variant: "destructive" });
        return;
      }

      await saveDocumentMutation.mutateAsync({
        ...formData,
        ...fileData
      });

    } catch (error) {
      setIsUploading(false);
      console.error("Submit error:", error);
    }
  };

  const handleDelete = () => {
    if (selectedDocument) deleteDocumentMutation.mutate(selectedDocument.id);
  };

  const openEditForm = (doc: Document) => {
    setSelectedDocument(doc);
    setUploadFile(null);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      isPublic: doc.isPublic,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setSelectedDocument(null);
    setUploadFile(null);
    setFormData({
      title: "",
      category: "profil",
      description: "",
      isPublic: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-sm text-muted-foreground">Total Dokumen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{documents.filter((d: any) => d.isPublic).length}</div>
            <p className="text-sm text-muted-foreground">Dokumen Publik</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Kategori</p>
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
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc: Document) => (
                <div key={doc.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-muted rounded">{categories.find(c => c.value === doc.category)?.label || doc.category}</span>
                        <span>{doc.fileType} • {formatFileSize(doc.fileSize)}</span>
                        <span>{new Date(doc.createdAt).getFullYear()}</span>
                        {doc.isPublic ? (
                          <span className="text-green-600">Publik</span>
                        ) : (
                          <span className="text-yellow-600">Internal</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => window.open(doc.fileUrl, '_blank')}>
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
              {filteredDocuments.length === 0 && <p className="text-center text-muted-foreground">Tidak ada data.</p>}
            </div>
          )}
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
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Publik</Label>
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
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                      toast({ title: "File dipilih", description: file.name });
                    }
                  }}
                />
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploadFile ? `File: ${uploadFile.name}` : (formData.fileUrl ? "File sudah ada (Klik untuk ganti)" : "Drag & drop atau klik untuk upload")}
                </p>
                <Button variant="outline" size="sm" className="mt-2" type="button">Pilih File</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isUploading || saveDocumentMutation.isPending}>
              {isUploading || saveDocumentMutation.isPending ? "Menyimpan..." : (selectedDocument ? "Simpan" : "Upload")}
            </Button>
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
