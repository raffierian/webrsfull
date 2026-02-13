import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, CreditCard, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPaymentSettings = () => {
    const queryClient = useQueryClient();

    // Fetch hospital settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['hospital-settings'],
        queryFn: () => api.hospitalSettings.get()
    });

    const [formData, setFormData] = useState({
        defaultConsultationFee: 50000,
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
        bankAccountName: 'RS Soewandhie',
        midtransServerKey: '',
        midtransClientKey: '',
        midtransIsProduction: false
    });

    // Update form when data loads
    useState(() => {
        if (settings) {
            setFormData({
                defaultConsultationFee: Number(settings.defaultConsultationFee) || 50000,
                bankName: settings.bankName || 'BCA',
                bankAccountNumber: settings.bankAccountNumber || '1234567890',
                bankAccountName: settings.bankAccountName || 'RS Soewandhie',
                midtransServerKey: settings.midtransServerKey || '',
                midtransClientKey: settings.midtransClientKey || '',
                midtransIsProduction: settings.midtransIsProduction || false
            });
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => api.hospitalSettings.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hospital-settings'] });
            toast.success('Pengaturan pembayaran berhasil disimpan!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menyimpan pengaturan');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
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
                <h1 className="text-3xl font-bold text-slate-800">Pengaturan Pembayaran</h1>
                <p className="text-slate-600 mt-1">Konfigurasi pembayaran konsultasi online</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Consultation Fee */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Tarif Konsultasi
                        </CardTitle>
                        <CardDescription>
                            Biaya default untuk konsultasi online
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="fee">Biaya Konsultasi (Rp)</Label>
                            <Input
                                id="fee"
                                type="number"
                                value={formData.defaultConsultationFee}
                                onChange={(e) => setFormData({ ...formData, defaultConsultationFee: Number(e.target.value) })}
                                placeholder="50000"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Account */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Rekening Bank (Transfer Manual)
                        </CardTitle>
                        <CardDescription>
                            Informasi rekening untuk pembayaran manual
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bankName">Nama Bank</Label>
                            <Input
                                id="bankName"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="BCA"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bankAccountNumber">Nomor Rekening</Label>
                            <Input
                                id="bankAccountNumber"
                                value={formData.bankAccountNumber}
                                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                                placeholder="1234567890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bankAccountName">Nama Pemilik Rekening</Label>
                            <Input
                                id="bankAccountName"
                                value={formData.bankAccountName}
                                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                                placeholder="RS Soewandhie"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Midtrans Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Konfigurasi Midtrans
                        </CardTitle>
                        <CardDescription>
                            Pengaturan payment gateway Midtrans (opsional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="midtransServerKey">Server Key</Label>
                            <Input
                                id="midtransServerKey"
                                type="password"
                                value={formData.midtransServerKey}
                                onChange={(e) => setFormData({ ...formData, midtransServerKey: e.target.value })}
                                placeholder="SB-Mid-server-..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="midtransClientKey">Client Key</Label>
                            <Input
                                id="midtransClientKey"
                                value={formData.midtransClientKey}
                                onChange={(e) => setFormData({ ...formData, midtransClientKey: e.target.value })}
                                placeholder="SB-Mid-client-..."
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="production">Mode Produksi</Label>
                                <p className="text-sm text-slate-500">
                                    Aktifkan untuk menggunakan production environment
                                </p>
                            </div>
                            <Switch
                                id="production"
                                checked={formData.midtransIsProduction}
                                onCheckedChange={(checked) => setFormData({ ...formData, midtransIsProduction: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Pengaturan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminPaymentSettings;
