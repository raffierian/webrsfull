import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    Shield,
    Smartphone,
    Save,
    Loader2,
    Key
} from "lucide-react";
import { toast } from "sonner";

const DoctorProfile = () => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Personal 2FA states
    const [twoFactorStep, setTwoFactorStep] = useState<"IDLE" | "SETUP" | "VERIFY">("IDLE");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isPersonal2FAEnabled, setIsPersonal2FAEnabled] = useState(false);

    // Fetch Current User
    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.auth.me(),
    });

    // Sync state with fetched data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username,
                name: user.name,
                email: user.email,
                phone: user.phone || ""
            }));
            setIsPersonal2FAEnabled(user.twoFactorEnabled);
        }
    }, [user]);

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.auth.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            toast.success("Profil berhasil diperbarui");
        },
        onError: (error: any) => toast.error(error.message || "Gagal memperbarui profil")
    });

    // Change Password Mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => api.auth.changePassword(data),
        onSuccess: () => {
            toast.success("Password berhasil diperbarui");
            // Clear password fields
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        },
        onError: (error: any) => toast.error(error.message || "Gagal memperbarui password")
    });

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        });
    };

    // 2FA Handlers
    const handleSetup2FA = async () => {
        try {
            const data = await api.auth.setup2FA();
            setQrCodeUrl(data.qrCodeUrl);
            setTwoFactorStep("SETUP");
        } catch (error: any) {
            toast.error(error.message || "Gagal mengatur 2FA");
        }
    };

    const handleVerify2FA = async () => {
        try {
            await api.auth.verify2FA(verificationCode);
            setIsPersonal2FAEnabled(true);
            setTwoFactorStep("IDLE");
            setVerificationCode("");
            toast.success("Google Authenticator berhasil diaktifkan");
            queryClient.invalidateQueries({ queryKey: ['me'] });
        } catch (error: any) {
            toast.error(error.message || "Kode verifikasi salah");
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm("Apakah Anda yakin ingin menonaktifkan Google Authenticator?")) return;
        try {
            await api.auth.disable2FA();
            setIsPersonal2FAEnabled(false);
            toast.success("Google Authenticator dinonaktifkan");
            queryClient.invalidateQueries({ queryKey: ['me'] });
        } catch (error: any) {
            toast.error(error.message || "Gagal menonaktifkan 2FA");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Profil Dokter</h1>
                <p className="text-slate-500">Kelola informasi akun dan pengaturan keamanan pribadi anda</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl">
                    <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg">
                        <User className="w-4 h-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2 rounded-lg">
                        <Shield className="w-4 h-4" />
                        Keamanan (2FA)
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2 rounded-lg">
                        <Key className="w-4 h-4" />
                        Ganti Password
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Informasi Akun</CardTitle>
                            <CardDescription>Perbarui nama, email, dan nomor telepon Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Username</Label>
                                    <Input
                                        value={formData.username}
                                        disabled
                                        className="bg-slate-50 border-slate-200"
                                    />
                                    <p className="text-[10px] text-slate-400">Username tidak dapat diubah.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Nama Lengkap</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="border-slate-200 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="border-slate-200 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600">Nomor Telepon</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="border-slate-200 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={updateProfileMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-4">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Keamanan Akun</CardTitle>
                            <CardDescription>Kelola metode autentikasi tambahan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Smartphone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800">Google Authenticator (2FA)</p>
                                        <p className="text-sm text-slate-500">Amankan akun dokter Anda dengan verifikasi 2 langkah.</p>
                                    </div>
                                    <div>
                                        {isPersonal2FAEnabled ? (
                                            <Button
                                                variant="outline"
                                                className="text-rose-500 border-rose-200 hover:bg-rose-50 rounded-xl"
                                                onClick={handleDisable2FA}
                                            >
                                                Nonaktifkan
                                            </Button>
                                        ) : twoFactorStep === "IDLE" ? (
                                            <Button
                                                onClick={handleSetup2FA}
                                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6"
                                            >
                                                Aktifkan Sekarang
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                {twoFactorStep === "SETUP" && (
                                    <div className="mt-8 space-y-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                                            <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50">
                                                <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44" />
                                            </div>
                                            <div className="space-y-6 flex-1 text-center md:text-left">
                                                <div className="space-y-2">
                                                    <p className="font-bold text-lg text-slate-800">1. Scan QR Code</p>
                                                    <p className="text-sm text-slate-500 leading-relaxed">
                                                        Buka aplikasi Google Authenticator,
                                                        lalu scan kode QR ini untuk menambahkan akun Anda.
                                                    </p>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="font-bold text-lg text-slate-800">2. Verifikasi Kode</p>
                                                    <p className="text-sm text-slate-500">
                                                        Masukkan 6 digit kode dari aplikasi:
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                                                        <Input
                                                            placeholder="000000"
                                                            className="max-w-[140px] text-center text-xl font-mono tracking-widest border-slate-200 focus:ring-primary/20 rounded-xl"
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value)}
                                                            maxLength={6}
                                                        />
                                                        <Button
                                                            onClick={handleVerify2FA}
                                                            disabled={verificationCode.length !== 6}
                                                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
                                                        >
                                                            Aktifkan Sekarang
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="text-slate-400 hover:text-slate-600 p-0 h-auto text-xs"
                                                    onClick={() => setTwoFactorStep("IDLE")}
                                                >
                                                    Batalkan Pengaturan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isPersonal2FAEnabled && (
                                    <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-100 text-sm font-medium">
                                        <div className="p-1.5 bg-emerald-100 rounded-full">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        Akun Anda telah diamankan dengan Google Authenticator.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Settings */}
                <TabsContent value="password" className="space-y-4">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Ganti Password</CardTitle>
                            <CardDescription>Perbarui password Anda secara berkala untuk menjaga keamanan akun.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 max-w-md">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Password Saat Ini</Label>
                                    <Input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password Baru</Label>
                                    <Input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Konfirmasi Password Baru</Label>
                                    <Input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="border-slate-200"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    if (!formData.currentPassword || !formData.newPassword) {
                                        toast.error("Password harus diisi");
                                        return;
                                    }
                                    if (formData.newPassword !== formData.confirmPassword) {
                                        toast.error("Konfirmasi password tidak cocok");
                                        return;
                                    }
                                    changePasswordMutation.mutate({
                                        currentPassword: formData.currentPassword,
                                        newPassword: formData.newPassword
                                    });
                                }}
                                disabled={changePasswordMutation.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8"
                            >
                                <Key className="w-4 h-4 mr-2" />
                                {changePasswordMutation.isPending ? 'Memproses...' : 'Ganti Password'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DoctorProfile;
