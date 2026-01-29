import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Bed, Search, Filter, MoreHorizontal, FileSpreadsheet } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const roomTypeLabels: Record<string, string> = {
    PAVILIUN_EXECUTIVE: 'Paviliun Executive',
    PAVILIUN_DELUXE: 'Paviliun Deluxe',
    KELAS_1: 'Kelas I',
    KELAS_2: 'Kelas II',
    KELAS_3: 'Kelas III',
    ISOLASI: 'Isolasi',
    INTENSIF: 'Intensif',
    INTENSIF_LAINNYA: 'Intensif Lainnya',
    PERINATOLOGI: 'Perinatologi',
};

const statusLabels: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Tersedia', color: 'bg-green-100 text-green-800' },
    OCCUPIED: { label: 'Terisi', color: 'bg-red-100 text-red-800' },
    MAINTENANCE: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    RESERVED: { label: 'Reserved', color: 'bg-blue-100 text-blue-800' },
};

export default function AdminInpatientRooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        roomName: '',
        roomType: 'KELAS_3',
        floor: 1,
        building: '',
        capacity: 1,
        pricePerDay: '',
        facilities: '',
        imageUrl: '',
        description: '',
    });
    const { toast } = useToast();

    const [importOpen, setImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const [manageBedsOpen, setManageBedsOpen] = useState(false);
    const [selectedRoomForBeds, setSelectedRoomForBeds] = useState<any>(null);
    const [bedCount, setBedCount] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadRooms();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [pagination.page, filterType, filterStatus, search]);

    const loadRooms = async () => {
        try {
            setLoading(true);
            let query = `page=${pagination.page}&limit=${pagination.limit}`;
            if (filterType !== 'ALL') query += `&type=${filterType}`;
            if (filterStatus !== 'ALL') query += `&status=${filterStatus}`;
            if (search) query += `&search=${search}`;

            const data = await api.inpatientRooms.getAll(query);
            setRooms(data.rooms || []);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal memuat data kamar',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                floor: parseInt(formData.floor as any),
                capacity: parseInt(formData.capacity as any),
                pricePerDay: parseFloat(formData.pricePerDay),
                facilities: formData.facilities ? JSON.parse(formData.facilities) : null,
            };

            if (editingRoom) {
                await api.inpatientRooms.update(editingRoom.id, payload);
                toast({ title: 'Sukses', description: 'Kamar berhasil diupdate' });
            } else {
                await api.inpatientRooms.create(payload);
                toast({ title: 'Sukses', description: 'Kamar berhasil ditambahkan' });
            }

            setIsDialogOpen(false);
            resetForm();
            loadRooms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menyimpan data',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (room: any) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            roomName: room.roomName || '',
            roomType: room.roomType,
            floor: room.floor,
            building: room.building || '',
            capacity: room.capacity,
            pricePerDay: room.pricePerDay,
            facilities: room.facilities ? JSON.stringify(room.facilities) : '',
            imageUrl: room.imageUrl || '',
            description: room.description || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus kamar ini?')) return;

        try {
            await api.inpatientRooms.delete(id);
            toast({ title: 'Sukses', description: 'Kamar berhasil dihapus' });
            loadRooms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menghapus kamar',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.inpatientRooms.updateStatus(id, { status });
            toast({ title: 'Sukses', description: 'Status berhasil diupdate' });
            loadRooms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal update status',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setEditingRoom(null);
        setFormData({
            roomNumber: '',
            roomName: '',
            roomType: 'KELAS_3',
            floor: 1,
            building: '',
            capacity: 1,
            pricePerDay: '',
            facilities: '',
            imageUrl: '',
            description: '',
        });
    };

    const handleImport = async () => {
        if (!importFile) return;

        try {
            setImporting(true);
            const result = await api.inpatientRooms.import(importFile);
            setImportResult(result);
            toast({ title: 'Import Selesai', description: `Sukses: ${result.success}, Gagal: ${result.failed}` });
            loadRooms();
        } catch (error: any) {
            toast({
                title: 'Error Import',
                description: error.message || 'Gagal mengimport data',
                variant: 'destructive',
            });
        } finally {
            setImporting(false);
        }
    };

    const openManageBeds = (room: any) => {
        setSelectedRoomForBeds(room);
        setBedCount(room.occupiedBeds);
        setManageBedsOpen(true);
    };

    const handleSaveBeds = async () => {
        if (!selectedRoomForBeds) return;
        try {
            await api.inpatientRooms.updateStatus(selectedRoomForBeds.id, {
                occupiedBeds: bedCount,
            });
            toast({ title: 'Sukses', description: 'Jumlah bed terisi berhasil diupdate' });
            setManageBedsOpen(false);
            loadRooms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal update bed',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* ... Header ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Kamar</h1>
                    <p className="text-gray-500">Kelola master data kamar rawat inap ({pagination.total} kamar total)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportOpen(true)}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Import Excel
                    </Button>
                    <Button variant="outline" onClick={loadRooms}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kamar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    {/* ... Search Filter ... */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* ... existing search/filter UI ... */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nomor kamar..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipe Kamar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Tipe</SelectItem>
                                {Object.entries(roomTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                {Object.entries(statusLabels).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Lantai</TableHead>
                                <TableHead>Kapasitas</TableHead>
                                <TableHead>Tarif/Hari</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Loading data...
                                    </TableCell>
                                </TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Tidak ada data kamar ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{room.roomNumber}</span>
                                                {room.roomName && <span className="text-xs text-muted-foreground">{room.roomName}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{roomTypeLabels[room.roomType]}</Badge>
                                        </TableCell>
                                        <TableCell>{room.floor} - {room.building}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm w-12 text-center">
                                                    {room.occupiedBeds} / {room.capacity}
                                                </div>
                                                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${room.occupiedBeds >= room.capacity ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>Rp {parseFloat(room.pricePerDay).toLocaleString('id-ID')}</TableCell>
                                        <TableCell>
                                            <Badge className={statusLabels[room.status].color} variant="secondary">
                                                {statusLabels[room.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => openManageBeds(room)}>
                                                        <Bed className="mr-2 h-4 w-4" /> Atur Bed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(room.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </Card>

            <Dialog open={manageBedsOpen} onOpenChange={setManageBedsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atur Bed - Kamar {selectedRoomForBeds?.roomNumber}</DialogTitle>
                        <DialogDescription>
                            Update jumlah bed yang terisi saat ini. Kapasitas Bed: {selectedRoomForBeds?.capacity}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex items-center justify-center gap-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setBedCount(prev => Math.max(0, prev - 1))}
                            disabled={bedCount <= 0}
                        >
                            -
                        </Button>
                        <div className="text-4xl font-bold w-12 text-center">{bedCount}</div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setBedCount(prev => Math.min(selectedRoomForBeds?.capacity || 1, prev + 1))}
                            disabled={bedCount >= (selectedRoomForBeds?.capacity || 1)}
                        >
                            +
                        </Button>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                        Status akan otomatis berubah menjadi {bedCount >= (selectedRoomForBeds?.capacity || 1) ? 'TERISI' : 'TERSEDIA'}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setManageBedsOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveBeds}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Data Kamar (Excel)</DialogTitle>
                        <DialogDescription>
                            Format kolom: Nomor Kamar, Nama Ruangan (Opsional), Tipe, Lantai, Gedung, Kapasitas, Tarif, Fasilitas, Deskripsi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                        />
                        {importResult && (
                            <div className="text-sm space-y-2">
                                <div className="flex gap-4">
                                    <span className="text-green-600 font-medium">Sukses: {importResult.success}</span>
                                    <span className="text-red-600 font-medium">Gagal: {importResult.failed}</span>
                                </div>
                                {importResult.errors.length > 0 && (
                                    <div className="mt-2 max-h-32 overflow-y-auto text-xs text-red-500 border p-2 rounded bg-red-50">
                                        {importResult.errors.map((e: any, i: number) => (
                                            <div key={i}>Row {e.roomNumber}: {e.error}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setImportOpen(false); setImportResult(null); }}>Tutup</Button>
                        <Button onClick={handleImport} disabled={!importFile || importing}>
                            {importing ? 'Mengupload...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}</DialogTitle>
                        <DialogDescription>
                            Isi informasi kamar rawat inap
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="roomNumber">Nomor Kamar *</Label>
                                    <Input
                                        id="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="roomName">Nama Ruangan</Label>
                                    <Input
                                        id="roomName"
                                        value={(formData as any).roomName || ''}
                                        onChange={(e) => setFormData({ ...formData, roomName: e.target.value } as any)}
                                        placeholder="Contoh: Mawar, Melati"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="roomType">Tipe Kamar *</Label>
                                    <Select
                                        value={formData.roomType}
                                        onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(roomTypeLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* ... existing floor/capacity/price inputs ... */}
                                <div>
                                    <Label htmlFor="floor">Lantai *</Label>
                                    <Input
                                        id="floor"
                                        type="number"
                                        value={formData.floor}
                                        onChange={(e) => setFormData({ ...formData, floor: e.target.value as any })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="capacity">Kapasitas (bed) *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value as any })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pricePerDay">Tarif/Hari *</Label>
                                    <Input
                                        id="pricePerDay"
                                        type="number"
                                        value={formData.pricePerDay}
                                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* ... remaining fields ... */}
                            <div>
                                <Label htmlFor="building">Gedung</Label>
                                <Input
                                    id="building"
                                    value={formData.building}
                                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="facilities">Fasilitas (JSON)</Label>
                                <Textarea
                                    id="facilities"
                                    value={formData.facilities}
                                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                                    placeholder='["AC", "TV", "Kamar Mandi Dalam"]'
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: array JSON</p>
                            </div>

                            <div>
                                <Label htmlFor="imageUrl">URL Gambar</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
