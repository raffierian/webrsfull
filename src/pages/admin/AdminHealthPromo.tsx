import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
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
    Image as ImageIcon,
    Video,
    BookOpen,
    MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminHealthPromo = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // New Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        type: "LEAFLET",
        description: "",
        fileUrl: "",
        thumbnailUrl: "",
    });

    // Fetch Data
    const { data: promosData, isLoading } = useQuery({
        queryKey: ['health-promos', typeFilter, searchTerm],
        queryFn: () => api.healthPromos.getAllAdmin(`type=${typeFilter !== 'all' ? typeFilter : ''}&search=${searchTerm}`),
    });

    const promos = promosData || [];

    // Upload Mutation
    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.upload(formData);
        },
        onError: (error: any) => {
            toast({ title: "Upload Gagal", description: error.message, variant: "destructive" });
        }
    });

    // CRUD Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => api.healthPromos.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-promos'] });
            toast({ title: "Berhasil", description: "Media promosi berhasil ditambahkan" });
            setIsFormOpen(false);
            resetForm();
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.healthPromos.update(selectedItem.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-promos'] });
            toast({ title: "Berhasil", description: "Media promosi berhasil diperbarui" });
            setIsFormOpen(false);
            resetForm();
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.healthPromos.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health-promos'] });
            toast({ title: "Berhasil", description: "Media promosi berhasil dihapus" });
            setIsDeleteOpen(false);
            setSelectedItem(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const handleSubmit = async () => {
        if (!formData.title) {
            toast({ title: "Error", description: "Judul wajib diisi", variant: "destructive" });
            return;
        }

        try {
            let finalFileUrl = formData.fileUrl;

            // Handle File Upload if selected
            if (uploadFile) {
                setIsUploading(true);
                const uploadRes = await uploadFileMutation.mutateAsync(uploadFile);
                finalFileUrl = uploadRes.url;
                setIsUploading(false);
            }

            if (!finalFileUrl) {
                toast({ title: "Error", description: "Wajib upload file atau isi URL", variant: "destructive" });
                return;
            }

            const dataToSave = { ...formData, fileUrl: finalFileUrl };

            if (selectedItem) {
                await updateMutation.mutateAsync(dataToSave);
            } else {
                await createMutation.mutateAsync(dataToSave);
            }
        } catch (error) {
            setIsUploading(false);
        }
    };

    const openEditForm = (item: any) => {
        setSelectedItem(item);
        setUploadFile(null); // Reset upload file logic
        setFormData({
            title: item.title,
            type: item.type,
            description: item.description || "",
            fileUrl: item.fileUrl,
            thumbnailUrl: item.thumbnailUrl || "",
        });
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setSelectedItem(null);
        setUploadFile(null);
        setFormData({
            title: "",
            type: "LEAFLET",
            description: "",
            fileUrl: "",
            thumbnailUrl: "",
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'LEAFLET': return <FileText className="w-4 h-4" />;
            case 'POSTER': return <ImageIcon className="w-4 h-4" />;
            case 'VIDEO': return <Video className="w-4 h-4" />;
            case 'BOOKLET': return <BookOpen className="w-4 h-4" />;
            default: return <MoreHorizontal className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Promosi Kesehatan (PKRS)</h1>
                    <p className="text-muted-foreground">Kelola media edukasi dan promosi kesehatan</p>
                </div>
                <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Media
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari media..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipe Media" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="LEAFLET">Leaflet</SelectItem>
                                <SelectItem value="POSTER">Poster</SelectItem>
                                <SelectItem value="VIDEO">Video</SelectItem>
                                <SelectItem value="BOOKLET">Booklet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Loading...</p>
                ) : promos.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-muted relative">
                            {item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                    {getIcon(item.type)}
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-semibold shadow-sm">
                                    {item.type}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                {item.description || "Tidak ada deskripsi"}
                            </p>
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">Lihat</a>
                                </Button>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEditForm(item)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {promos.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                    Belum ada media promosi kesehatan.
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? "Edit Media" : "Tambah Media Baru"}</DialogTitle>
                        <DialogDescription>Isi detail media promosi kesehatan</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul *</Label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe Media *</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LEAFLET">Leaflet (PDF)</SelectItem>
                                    <SelectItem value="POSTER">Poster (Gambar)</SelectItem>
                                    <SelectItem value="VIDEO">Video (Youtube/MP4)</SelectItem>
                                    <SelectItem value="BOOKLET">Booklet (PDF)</SelectItem>
                                    <SelectItem value="OTHER">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Upload File {formData.type === 'VIDEO' ? '(Opsional jika pakai Link)' : '*'}</Label>
                            <Input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                accept={formData.type === 'POSTER' ? "image/*" : formData.type === 'VIDEO' ? "video/*" : ".pdf,.doc,.docx"}
                            />
                            {formData.fileUrl && (
                                <p className="text-xs text-muted-foreground break-all">File saat ini: {formData.fileUrl}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Atau Masukkan URL (External Link/Youtube)</Label>
                            <Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Thumbnail URL (Opsional)</Label>
                            <Input value={formData.thumbnailUrl} onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={isUploading || createMutation.isPending || updateMutation.isPending}>
                            {isUploading ? "Mengupload..." : createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Media?</AlertDialogTitle>
                        <AlertDialogDescription>Anda yakin ingin menghapus media ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)} className="bg-destructive text-destructive-foreground">
                            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminHealthPromo;
