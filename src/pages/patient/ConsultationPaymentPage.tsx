import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Upload, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

declare global {
    interface Window {
        snap: any;
    }
}

const ConsultationPaymentPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'manual'>('midtrans');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentId, setPaymentId] = useState<string | null>(null);

    // Guest user form data
    const [guestData, setGuestData] = useState({
        name: '',
        email: '',
        phone: '',
        nik: ''
    });

    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('token');

    // Get consultation fee from navigation state or default
    const consultationFee = (location.state as any)?.consultationFee || 50000;

    // Fetch hospital settings for bank details
    const { data: hospitalSettings } = useQuery({
        queryKey: ['hospital-settings'],
        queryFn: () => api.hospitalSettings.get()
    });

    // Log session ID on mount
    React.useEffect(() => {
        console.log('Payment page loaded with sessionId:', sessionId);
        if (!sessionId) {
            console.error('No sessionId found in URL!');
            toast.error('Session tidak valid');
            navigate('/patient/consultation');
        }
    }, [sessionId, navigate]);

    // Fetch session details
    const { data: sessionData, isLoading } = useQuery({
        queryKey: ['consultation-session', sessionId],
        queryFn: async () => {
            // Get session info from createSession response or fetch separately
            const response = await api.consultationChat.getMessages(sessionId!);
            return response;
        },
        enabled: !!sessionId
    });

    // Poll payment status
    const { data: paymentStatus } = useQuery({
        queryKey: ['payment-status', paymentId],
        queryFn: () => api.payment.getStatus(paymentId!),
        enabled: !!paymentId,
        refetchInterval: (query) => {
            // Stop polling if paid
            if (query.state.data?.status === 'PAID') return false;
            return 3000; // Poll every 3 seconds
        }
    });

    useEffect(() => {
        if (paymentStatus?.status === 'PAID') {
            toast.success('Pembayaran berhasil!');
            setTimeout(() => {
                navigate(`/patient/consultation/chat/${sessionId}`);
            }, 1500);
        }
    }, [paymentStatus, sessionId, navigate]);

    // Validate guest data if not authenticated
    const validateGuestData = () => {
        if (!isAuthenticated) {
            if (!guestData.name || !guestData.email || !guestData.phone) {
                toast.error('Mohon lengkapi data diri Anda');
                return false;
            }
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(guestData.email)) {
                toast.error('Format email tidak valid');
                return false;
            }
            // Basic phone validation
            if (guestData.phone.length < 10) {
                toast.error('Nomor telepon tidak valid');
                return false;
            }
        }
        return true;
    };

    const handleMidtransPayment = async () => {
        if (!validateGuestData()) return;

        try {
            setIsProcessing(true);

            const response = await api.payment.create({
                chatSessionId: sessionId!,
                paymentMethod: 'midtrans',
                // Include guest data if not authenticated
                ...(!isAuthenticated && { guestData })
            });

            // Auto-login if account created
            if (response.authToken && response.user) {
                localStorage.setItem('token', response.authToken);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            setPaymentId(response.paymentId);

            // Load Midtrans Snap
            if (window.snap) {
                window.snap.pay(response.snapToken, {
                    onSuccess: function () {
                        toast.success('Pembayaran berhasil!');
                        navigate(`/patient/consultation/chat/${sessionId}`);
                    },
                    onPending: function () {
                        toast.info('Menunggu pembayaran...');
                    },
                    onError: function () {
                        toast.error('Pembayaran gagal');
                        setIsProcessing(false);
                    },
                    onClose: function () {
                        setIsProcessing(false);
                    }
                });
            } else {
                toast.error('Midtrans belum siap. Silakan refresh halaman.');
                setIsProcessing(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal membuat pembayaran');
            setIsProcessing(false);
        }
    };

    const handleManualPayment = async () => {
        if (!validateGuestData()) return;
        if (!proofFile) {
            toast.error('Mohon upload bukti transfer terlebih dahulu');
            return;
        }

        try {
            setIsProcessing(true);

            // 1. Create payment record
            const response = await api.payment.create({
                chatSessionId: sessionId!,
                paymentMethod: 'manual',
                // Include guest data if not authenticated
                ...(!isAuthenticated && { guestData })
            });

            // Auto-login if account created
            if (response.authToken && response.user) {
                localStorage.setItem('token', response.authToken);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            const currentPaymentId = response.paymentId || response.id;
            console.log('Payment created/retrieved, ID:', currentPaymentId);

            if (!currentPaymentId) {
                throw new Error('Gagal mendapatkan ID Pembayaran');
            }

            setPaymentId(currentPaymentId);

            // 2. Upload proof file
            const formData = new FormData();
            formData.append('file', proofFile);
            const uploadResponse = await api.upload(formData);
            const proofUrl = uploadResponse.url;

            // 3. Link proof to payment
            await api.payment.uploadProof(currentPaymentId, proofUrl);

            toast.success('Bukti pembayaran berhasil diupload! Mohon tunggu konfirmasi admin.');

            // Success state - redirect to list or dashboard after 2 seconds
            setTimeout(() => {
                navigate('/patient/consultation');
            }, 2000);

        } catch (error: any) {
            console.error('Manual payment error:', error);
            toast.error(error.message || 'Gagal memproses pembayaran manual');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === 'midtrans') {
            await handleMidtransPayment();
        } else {
            await handleManualPayment();
        }
    };

    if (isLoading) {
        return (
            <div className="container max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Pembayaran Konsultasi</h1>
                <p className="text-slate-600 mt-1">Selesaikan pembayaran untuk memulai konsultasi</p>
            </div>

            {/* Guest User Form - Only show if not authenticated */}
            {!isAuthenticated && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Informasi Pasien</CardTitle>
                        <CardDescription>Lengkapi data diri Anda untuk melanjutkan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                value={guestData.name}
                                onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={guestData.email}
                                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon *</Label>
                            <Input
                                id="phone"
                                value={guestData.phone}
                                onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nik">NIK (Opsional)</Label>
                            <Input
                                id="nik"
                                value={guestData.nik}
                                onChange={(e) => setGuestData({ ...guestData, nik: e.target.value })}
                                placeholder="16 digit NIK"
                                maxLength={16}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Amount Card */}
            <Card className="mb-6 border-2 border-teal-500">
                <CardHeader className="bg-teal-50">
                    <CardTitle className="text-teal-900">Total Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Biaya Konsultasi Online</p>
                            <p className="text-xs text-slate-500 mt-1">Session ID: {sessionId?.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-teal-600">
                                Rp {Number(consultationFee).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {paymentStatus?.status === 'PENDING' && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="font-semibold text-yellow-900">Menunggu Pembayaran</p>
                                <p className="text-sm text-yellow-700">
                                    {paymentMethod === 'manual'
                                        ? 'Menunggu konfirmasi admin'
                                        : 'Silakan selesaikan pembayaran'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Pilih Metode Pembayaran</CardTitle>
                        <CardDescription>Pilih cara pembayaran yang Anda inginkan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                            <div className="space-y-3">
                                <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'midtrans' ? 'border-teal-600 bg-teal-50' : 'border-slate-200'
                                    }`}>
                                    <RadioGroupItem value="midtrans" id="midtrans" />
                                    <Label htmlFor="midtrans" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-teal-600" />
                                            <div>
                                                <p className="font-semibold">Midtrans (Otomatis)</p>
                                                <p className="text-sm text-slate-600">QRIS, Virtual Account, E-wallet</p>
                                            </div>
                                        </div>
                                    </Label>
                                </div>

                                <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-teal-600 bg-teal-50' : 'border-slate-200'
                                    }`}>
                                    <RadioGroupItem value="manual" id="manual" />
                                    <Label htmlFor="manual" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Upload className="w-5 h-5 text-teal-600" />
                                            <div>
                                                <p className="font-semibold">Transfer Manual</p>
                                                <p className="text-sm text-slate-600">Transfer ke rekening RS</p>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {paymentMethod === 'manual' && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Informasi Rekening</CardTitle>
                            <CardDescription>Transfer ke rekening berikut</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Bank</p>
                                <p className="font-bold text-lg">{hospitalSettings?.bankName || 'BCA'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Nomor Rekening</p>
                                <p className="font-bold text-lg">{hospitalSettings?.bankAccountNumber || '1234567890'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Atas Nama</p>
                                <p className="font-bold text-lg">{hospitalSettings?.bankAccountName || 'RS Soewandhie'}</p>
                            </div>

                            <div>
                                <Label htmlFor="proof">Upload Bukti Transfer *</Label>
                                <Input
                                    id="proof"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="mt-1"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        paymentMethod === 'midtrans' ? 'Bayar Sekarang' : 'Upload Bukti Transfer'
                    )}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => navigate('/patient/consultation')}
                >
                    Kembali
                </Button>
            </form>
        </div>
    );
};

export default ConsultationPaymentPage;
