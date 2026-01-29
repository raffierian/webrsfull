import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Plus, Search, Edit2, Trash2, Tag, DollarSign, Layers, Check, X, FileUp, Download, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const categories = ['Akomodasi', 'Pelayanan Medik', 'Administrasi', 'Penunjang Medis', 'Tindakan Bedah', 'Radiologi', 'Laboratorium'];

const AdminTariffs: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTariff, setEditingTariff] = useState<any>(null);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    // Fetch Tariffs
    const { data: tariffsData, isLoading } = useQuery({
        queryKey: ['admin-tariffs'],
        queryFn: api.tariffs.getAllAdmin,
    });

    const tariffs = (tariffsData as any)?.data || [];

    // Mutations
    const createMutation = useMutation({
        mutationFn: api.tariffs.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            toast.success('Tarif berhasil ditambahkan');
            setIsDialogOpen(false);
        },
        onError: (error: any) => toast.error(error.message || 'Gagal menambahkan tarif')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.tariffs.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            toast.success('Tarif berhasil diperbarui');
            setIsDialogOpen(false);
        },
        onError: (error: any) => toast.error(error.message || 'Gagal memperbarui tarif')
    });

    const deleteMutation = useMutation({
        mutationFn: api.tariffs.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            toast.success('Tarif berhasil dihapus');
        },
        onError: (error: any) => toast.error(error.message || 'Gagal menghapus tarif')
    });

    const importMutation = useMutation({
        mutationFn: api.tariffs.import,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            toast.success('Data tarif berhasil diimport');
            setIsImportDialogOpen(false);
            setImportFile(null);
        },
        onError: (error: any) => toast.error(error.message || 'Gagal mengimport data')
    });

    const handleDownloadTemplate = () => {
        const headers = ['Layanan', 'Kategori', 'Kelas1', 'Kelas2', 'Kelas3', 'VIP', 'Flat', 'Unit'];
        const rows = [
            ['Kamar Rawat Inap', 'Akomodasi', '750000', '500000', '250000', '1500000', '', 'Hari'],
            ['Konsultasi Dokter Spesialis', 'Pelayanan Medik', '', '', '', '150000', '150000', 'Sesi']
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_tarif.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (importFile) {
            importMutation.mutate(importFile);
        }
    };

    const filteredTariffs = tariffs.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            category: formData.get('category'),
            price1: formData.get('price1'),
            price2: formData.get('price2'),
            price3: formData.get('price3'),
            priceVip: formData.get('priceVip'),
            priceFlat: formData.get('priceFlat'),
            isFlat: formData.get('isFlat') === 'true',
            unit: formData.get('unit'),
            isActive: true,
        };

        if (editingTariff) {
            updateMutation.mutate({ id: editingTariff.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Tarif</h1>
                    <p className="text-muted-foreground">Atur tarif layanan dan akomodasi rumah sakit</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
                        <FileUp className="w-4 h-4" />
                        Import Excel
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={() => setEditingTariff(null)}>
                                <Plus className="w-4 h-4" />
                                Tambah Tarif
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingTariff ? 'Edit Tarif' : 'Tambah Tarif Baru'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Layanan/Kamar *</Label>
                                        <Input id="name" name="name" defaultValue={editingTariff?.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori *</Label>
                                        <Select name="category" defaultValue={editingTariff?.category || categories[0]}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="unit">Satuan (Contoh: Hari, Sesi, Sekali)</Label>
                                        <Input id="unit" name="unit" defaultValue={editingTariff?.unit} placeholder="Hari" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="isFlat">Tipe Harga</Label>
                                        <Select name="isFlat" defaultValue={String(editingTariff?.isFlat || false)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="false">Harga Berdasarkan Kelas</SelectItem>
                                                <SelectItem value="true">Harga Flat (Satu Harga)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="border p-4 rounded-lg space-y-4 bg-muted/30">
                                    <Label className="font-bold underline">Rincian Harga</Label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="priceFlat">Harga Flat (Jika Tipe Flat)</Label>
                                            <Input type="number" id="priceFlat" name="priceFlat" defaultValue={editingTariff?.priceFlat} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priceVip">Harga VIP</Label>
                                            <Input type="number" id="priceVip" name="priceVip" defaultValue={editingTariff?.priceVip} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price1">Harga Kelas 1</Label>
                                            <Input type="number" id="price1" name="price1" defaultValue={editingTariff?.price1} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price2">Harga Kelas 2</Label>
                                            <Input type="number" id="price2" name="price2" defaultValue={editingTariff?.price2} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price3">Harga Kelas 3</Label>
                                            <Input type="number" id="price3" name="price3" defaultValue={editingTariff?.price3} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingTariff ? 'Simpan Perubahan' : 'Tambah Tarif'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Data Tarif</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 border border-dashed rounded-lg text-center space-y-3">
                            <FileUp className="w-10 h-10 text-muted-foreground mx-auto" />
                            <div className="text-sm">
                                <p className="font-medium">Pilih file Excel atau CSV</p>
                                <p className="text-muted-foreground text-xs">File harus sesuai dengan format template</p>
                            </div>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                id="import-file"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            />
                            <Label
                                htmlFor="import-file"
                                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer"
                            >
                                Pilih File
                            </Label>
                            {importFile && (
                                <p className="text-xs font-medium text-green-600">
                                    File terpilih: {importFile.name}
                                </p>
                            )}
                        </div>

                        <Button
                            variant="link"
                            className="w-full text-xs gap-2"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="w-3 h-3" />
                            Download Template CSV
                        </Button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Batal</Button>
                        <Button
                            onClick={handleImportSubmit}
                            disabled={!importFile || importMutation.isPending}
                        >
                            {importMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Mulai Import
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Cari tarif atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="bg-card rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Layanan</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Satuan</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead className="text-right">Harga (Rp)</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Memuat data...</TableCell></TableRow>
                        ) : filteredTariffs.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada data tarif</TableCell></TableRow>
                        ) : filteredTariffs.map((tariff: any) => (
                            <TableRow key={tariff.id}>
                                <TableCell className="font-medium">{tariff.name}</TableCell>
                                <TableCell><Badge variant="outline">{tariff.category}</Badge></TableCell>
                                <TableCell>{tariff.unit || '-'}</TableCell>
                                <TableCell>
                                    {tariff.isFlat ? (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Flat</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Kelas</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {tariff.isFlat ? (
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('id-ID').format(tariff.priceFlat)}
                                        </span>
                                    ) : (
                                        <div className="text-xs space-y-1">
                                            <div><span className="text-muted-foreground mr-1">VIP:</span> {new Intl.NumberFormat('id-ID').format(tariff.priceVip)}</div>
                                            <div><span className="text-muted-foreground mr-1">K1:</span> {new Intl.NumberFormat('id-ID').format(tariff.price1)}</div>
                                            <div><span className="text-muted-foreground mr-1">K2:</span> {new Intl.NumberFormat('id-ID').format(tariff.price2)}</div>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingTariff(tariff);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm('Yakin ingin menghapus tarif ini?')) {
                                                    deleteMutation.mutate(tariff.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminTariffs;
