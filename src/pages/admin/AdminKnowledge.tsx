import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Brain,
    FileText,
    CheckCircle2,
    XCircle,
    Info,
    Tag,
    Loader2
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
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AdminKnowledge: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingKnowledge, setEditingKnowledge] = useState<any>(null);

    // Fetch Knowledge
    const { data: knowledge = [], isLoading } = useQuery({
        queryKey: ['admin-knowledge'],
        queryFn: () => api.knowledge.getAll(),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => api.knowledge.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
            toast.success('Informasi berhasil ditambahkan');
            setIsDialogOpen(false);
            setEditingKnowledge(null);
        },
        onError: (error: any) => toast.error(error.message || 'Gagal menambahkan informasi')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.knowledge.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
            toast.success('Informasi berhasil diperbarui');
            setIsDialogOpen(false);
            setEditingKnowledge(null);
        },
        onError: (error: any) => toast.error(error.message || 'Gagal memperbarui informasi')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.knowledge.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
            toast.success('Informasi berhasil dihapus');
        },
        onError: (error: any) => toast.error(error.message || 'Gagal menghapus informasi')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => api.knowledge.toggle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
            toast.success('Status informasi diperbarui');
        }
    });

    const filteredKnowledge = knowledge.filter((item: any) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus informasi ini? Ini akan berpengaruh pada kemampuan Chatbot menjawab.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            title: formData.get('title') as string,
            category: formData.get('category') as string,
            content: formData.get('content') as string,
            isActive: true
        };

        if (editingKnowledge) {
            updateMutation.mutate({ id: editingKnowledge.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary" />
                        Pengetahuan Chatbot AI
                    </h1>
                    <p className="text-muted-foreground">Kelola informasi yang digunakan Chatbot untuk menjawab pengunjung</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setEditingKnowledge(null)}>
                            <Plus className="w-4 h-4" />
                            Tambah Pengetahuan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingKnowledge ? 'Edit Pengetahuan' : 'Tambah Pengetahuan Baru'}</DialogTitle>
                            <DialogDescription>
                                Berikan informasi detail agar Chatbot bisa menjawab pertanyaan pengunjung dengan akurat.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Judul / Pertanyaan Umum *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={editingKnowledge?.title}
                                    placeholder="Contoh: Jadwal Berkunjung atau Syarat Rawat Inap"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Kategori (Opsional)</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    defaultValue={editingKnowledge?.category}
                                    placeholder="Contoh: Layanan, Umum, Biaya"
                                />
                            </div>
                            <div>
                                <Label htmlFor="content">Detail Informasi / Penjelasan Lengkap *</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    defaultValue={editingKnowledge?.content}
                                    placeholder="Masukkan penjelasan lengkap yang ingin dipelajari oleh bot..."
                                    className="min-h-[250px]"
                                    required
                                />
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg flex gap-3 items-start">
                                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <strong>Tips:</strong> Chatbot tidak butuh format kaku. Gunakan bahasa yang natural.
                                    Semakin detail informasi yang Anda berikan, semakin pintar bot dalam menjawab.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingKnowledge ? 'Simpan Perubahan' : 'Tambah Pengetahuan')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari judul atau isi informasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Judul Informasi</TableHead>
                            <TableHead>Isi Informasi</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        <span>Sedang memuat data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredKnowledge.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="max-w-[400px] mx-auto text-center">
                                        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">Belum ada data pengetahuan</h3>
                                        <p className="text-muted-foreground mt-1">
                                            Chatbot saat ini hanya menjawab berdasarkan data Poli dan Layanan.
                                            Tambahkan informasi khusus untuk meningkatkan kecerdasannya.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            Tambah Sekarang
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredKnowledge.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium line-clamp-1">{item.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="gap-1 font-normal">
                                            <Tag className="w-3 h-3" />
                                            {item.category || 'Umum'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={item.isActive}
                                                onCheckedChange={() => toggleStatusMutation.mutate(item.id)}
                                            />
                                            <span className={`text-xs font-medium ${item.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                                {item.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingKnowledge(item);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-blue-900">Cara Kerja Bot</h3>
                        <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
                            Setiap informasi yang Anda tambahkan di sini akan dibaca oleh Chatbot AI setiap kali ada pengunjung bertanya.
                            Anda bisa memasukkan jadwal dokter, syarat pendaftaran, jenis asuransi yang diterima, atau informasi lainnya.
                            Bot akan merangkum jawaban berdasarkan data yang Anda berikan di sini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminKnowledge;
