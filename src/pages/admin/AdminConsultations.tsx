import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Search, Filter, Trash2, User, UserCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminConsultations = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data: sessions, isLoading } = useQuery({
        queryKey: ['admin-consultations', statusFilter],
        queryFn: () => api.consultationChat.getMySessions(statusFilter !== 'all' ? `status=${statusFilter}` : '')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.consultationChat.delete(id),
        onSuccess: () => {
            toast.success('Sesi konsultasi berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menghapus sesi');
        }
    });

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus sesi konsultasi ini? Semua pesan dan data terkait akan dihapus secara permanen.')) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Baru</span>;
            case 'PENDING':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>;
            case 'ACTIVE':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
            case 'CLOSED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Selesai</span>;
            case 'CANCELLED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Dibatalkan</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const filteredSessions = (sessions || []).filter((session: any) =>
        session.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Konsultasi Chat</h1>
                    <p className="text-muted-foreground">Monitor dan kelola semua sesi konsultasi chat.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter & Pencarian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari pasien, dokter, atau ID sesi..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="OPEN">Baru</SelectItem>
                                <SelectItem value="PENDING">Menunggu</SelectItem>
                                <SelectItem value="ACTIVE">Aktif</SelectItem>
                                <SelectItem value="CLOSED">Selesai</SelectItem>
                                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pembayaran</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : filteredSessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Tidak ada sesi konsultasi ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSessions.map((session: any) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{format(new Date(session.createdAt), 'dd MMM yyyy')}</span>
                                                <span className="text-xs text-muted-foreground">{format(new Date(session.createdAt), 'HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{session.patient?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{session.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                    <UserCheck className="w-4 h-4 text-secondary-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{session.doctor?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{session.doctor?.specialization}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                                        <TableCell>
                                            {session.isPaid ? (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Terbayar</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Belum Bayar</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(session.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminConsultations;
