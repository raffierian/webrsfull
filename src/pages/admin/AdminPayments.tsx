import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye, Download, Loader2, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminPayments = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

    // Fetch payments
    const { data: paymentsData, isLoading } = useQuery({
        queryKey: ['admin-payments', statusFilter, methodFilter],
        queryFn: () => {
            let params = '?';
            if (statusFilter !== 'all') params += `status=${statusFilter}&`;
            if (methodFilter !== 'all') params += `paymentMethod=${methodFilter}&`;
            return api.payment.getAll(params);
        }
    });

    // Ensure payments is always an array
    const payments = paymentsData?.payments || [];

    // Filter by search query
    const filteredPayments = payments.filter((payment: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            payment.user?.name?.toLowerCase().includes(query) ||
            payment.chatSession?.doctor?.name?.toLowerCase().includes(query) ||
            payment.id?.toLowerCase().includes(query)
        );
    });

    // Calculate stats
    const stats = {
        totalToday: payments.filter((p: any) =>
            format(new Date(p.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        ).length,
        pendingCount: payments.filter((p: any) =>
            p.status === 'PENDING' && (p.paymentMethod === 'midtrans' || !p.paymentProof)
        ).length,
        waitingConfirmationCount: payments.filter((p: any) =>
            p.status === 'PENDING' && p.paymentMethod === 'manual' && p.paymentProof
        ).length,
        revenueToday: payments
            .filter((p: any) =>
                p.status === 'PAID' &&
                format(new Date(p.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            )
            .reduce((sum: number, p: any) => sum + Number(p.amount), 0),
        revenueMonth: payments
            .filter((p: any) =>
                p.status === 'PAID' &&
                format(new Date(p.createdAt), 'yyyy-MM') === format(new Date(), 'yyyy-MM')
            )
            .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    };

    // Confirm payment mutation
    const confirmMutation = useMutation({
        mutationFn: (paymentId: string) => api.payment.confirm(paymentId),
        onSuccess: () => {
            toast.success('Pembayaran berhasil dikonfirmasi!');
            queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal konfirmasi pembayaran');
        }
    });

    const handleConfirm = (paymentId: string) => {
        if (confirm('Konfirmasi pembayaran ini?')) {
            confirmMutation.mutate(paymentId);
        }
    };

    const getStatusBadge = (payment: any) => {
        const { status, paymentProof, paymentMethod } = payment;

        if (status === 'PENDING' && paymentMethod === 'manual' && paymentProof) {
            return (
                <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 italic border-yellow-200">
                    <Clock className="w-3 h-3" />
                    Menunggu Konfirmasi
                </Badge>
            );
        }

        const variants: Record<string, { variant: any; icon: any; label: string }> = {
            PENDING: { variant: 'secondary', icon: Clock, label: 'Menunggu' },
            PAID: { variant: 'default', icon: CheckCircle, label: 'Lunas' },
            FAILED: { variant: 'destructive', icon: XCircle, label: 'Gagal' },
            EXPIRED: { variant: 'outline', icon: AlertCircle, label: 'Kadaluarsa' }
        };
        const config = variants[status] || variants.PENDING;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Pembayaran</h1>
                <p className="text-slate-600 mt-1">Kelola pembayaran konsultasi online</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pembayaran Hari Ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalToday}</div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-yellow-800 font-medium">Menunggu Konfirmasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.waitingConfirmationCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pendapatan Hari Ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            Rp {stats.revenueToday.toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pendapatan Bulan Ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            Rp {stats.revenueMonth.toLocaleString('id-ID')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter & Pencarian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="PENDING">Menunggu</SelectItem>
                                    <SelectItem value="PAID">Lunas</SelectItem>
                                    <SelectItem value="FAILED">Gagal</SelectItem>
                                    <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Metode</label>
                            <Select value={methodFilter} onValueChange={setMethodFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Metode</SelectItem>
                                    <SelectItem value="midtrans">Midtrans</SelectItem>
                                    <SelectItem value="manual">Transfer Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Cari</label>
                            <Input
                                placeholder="Cari pasien, dokter, atau ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pembayaran ({filteredPayments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Pasien</TableHead>
                                    <TableHead>Dokter</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                                            Tidak ada data pembayaran
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-xs">
                                                {payment.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>{payment.user?.name || 'N/A'}</TableCell>
                                            <TableCell>{payment.chatSession?.doctor?.name || 'N/A'}</TableCell>
                                            <TableCell className="font-semibold">
                                                Rp {Number(payment.amount).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {payment.paymentMethod === 'manual' ? 'Manual' : 'Midtrans'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment)}</TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {payment.status === 'PENDING' && payment.paymentMethod === 'manual' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleConfirm(payment.id)}
                                                            disabled={confirmMutation.isPending}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Konfirmasi
                                                        </Button>
                                                    )}
                                                    {payment.paymentProof && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedPayment(payment)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Bukti
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Proof Dialog */}
            <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detail Pembayaran & Bukti</DialogTitle>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pasien</p>
                                    <p className="font-semibold">{selectedPayment.user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dokter</p>
                                    <p className="font-semibold text-teal-700">{selectedPayment.chatSession?.doctor?.name || 'N/A'}</p>
                                    <p className="text-[10px] text-slate-500">{selectedPayment.chatSession?.doctor?.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Jumlah</p>
                                    <p className="font-bold">Rp {Number(selectedPayment.amount).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                    {getStatusBadge(selectedPayment)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Bukti Transfer:</label>
                                <div className="border rounded-lg overflow-hidden bg-slate-100">
                                    <img
                                        src={selectedPayment.paymentProof}
                                        alt="Bukti Pembayaran"
                                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                                    />
                                </div>
                            </div>

                            {selectedPayment.status === 'PENDING' && selectedPayment.paymentMethod === 'manual' && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                                        Tutup
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleConfirm(selectedPayment.id);
                                            setSelectedPayment(null);
                                        }}
                                        disabled={confirmMutation.isPending}
                                        className="bg-teal-600 hover:bg-teal-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Konfirmasi Pembayaran
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPayments;
