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
    Key,
    Stethoscope
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
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Memuat data profil Anda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Premium Hero Header */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 text-white pb-24 pt-8 md:pt-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-teal-50 text-xs font-medium backdrop-blur-sm border border-white/10 mb-2">
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Portal Telemedicine</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Profil Dokter</h1>
                            <p className="text-teal-100 max-w-xl text-sm md:text-base leading-relaxed">
                                Kelola informasi akun pribadi Anda, tingkatkan keamanan menggunakan autentikasi 2 langkah, dan perbarui kata sandi secara berkala.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-16">
                <Tabs defaultValue="profile" className="space-y-8">
                    {/* Modern Pill Toggles */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto scrollbar-hide max-w-2xl mx-auto">
                        <TabsList className="bg-transparent border-none w-full grid grid-cols-3 h-auto p-0">
                            <TabsTrigger
                                value="profile"
                                className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <User className="w-4 h-4" />
                                Profil
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <Shield className="w-4 h-4" />
                                2FA
                            </TabsTrigger>
                            <TabsTrigger
                                value="password"
                                className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                            >
                                <Key className="w-4 h-4" />
                                Sandi
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Profile Settings */}
                    <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden max-w-3xl mx-auto">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8">
                                <CardTitle className="text-2xl text-slate-800">Informasi Akun</CardTitle>
                                <CardDescription className="text-slate-500">Perbarui identitas, kontak, dan detail profil Anda di sini.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold">Username</Label>
                                        <Input
                                            value={formData.username}
                                            disabled
                                            className="bg-slate-50 border-slate-200 shadow-none text-slate-500 cursor-not-allowed rounded-xl h-11"
                                        />
                                        <p className="text-xs text-slate-400 font-medium">Username tidak dapat diubah setelah registrasi.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold">Nama Lengkap</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold">Alamat Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold">Nomor Telepon</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11 shadow-sm"
                                            placeholder="+62 8..."
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={updateProfileMutation.isPending}
                                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 shadow-lg shadow-teal-600/20 transition-all active:scale-95 text-base font-medium"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5 mr-2" />
                                        )}
                                        {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden max-w-3xl mx-auto">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8">
                                <CardTitle className="text-2xl text-slate-800">Keamanan Tambahan</CardTitle>
                                <CardDescription className="text-slate-500">Tingkatkan keamanan akun Anda agar terhindar dari akses tidak sah.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="space-y-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="p-3 bg-teal-50/80 border border-teal-100 rounded-xl w-fit">
                                            <Smartphone className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-lg">Google Authenticator (2FA)</p>
                                            <p className="text-sm text-slate-500 mt-1 max-w-sm">Berikan lapisan keamanan ekstra pada saat Anda login (Disarankan).</p>
                                        </div>
                                        <div>
                                            {isPersonal2FAEnabled ? (
                                                <Button
                                                    variant="outline"
                                                    className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-xl font-semibold h-11"
                                                    onClick={handleDisable2FA}
                                                >
                                                    Nonaktifkan Fitur
                                                </Button>
                                            ) : twoFactorStep === "IDLE" ? (
                                                <Button
                                                    onClick={handleSetup2FA}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-11 shadow-md shadow-slate-900/10 font-semibold"
                                                >
                                                    Aktifkan 2FA Sekarang
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    {twoFactorStep === "SETUP" && (
                                        <div className="mt-8 space-y-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                                                <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50">
                                                    <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 rounded-lg mix-blend-multiply" />
                                                </div>
                                                <div className="space-y-6 flex-1 text-center md:text-left">
                                                    <div className="space-y-2">
                                                        <p className="font-bold text-lg text-slate-800 flex items-center justify-center md:justify-start gap-2">
                                                            <span className="flex items-center justify-center bg-teal-100 text-teal-700 w-6 h-6 rounded-full text-sm">1</span>
                                                            Scan Kode QR Ini
                                                        </p>
                                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                            Gunakan aplikasi authenticator apapun (contoh: Google Auth, Authy).
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="font-bold text-lg text-slate-800 flex items-center justify-center md:justify-start gap-2">
                                                            <span className="flex items-center justify-center bg-teal-100 text-teal-700 w-6 h-6 rounded-full text-sm">2</span>
                                                            Pindai & Masukkan Kode Validasi
                                                        </p>
                                                        <p className="text-sm text-slate-500 font-medium text-balance">
                                                            Ketikkan 6 angka yang tertera di aplikasi authenticator dari handphone Anda.
                                                        </p>
                                                        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                                                            <Input
                                                                placeholder="0 0 0 0 0 0"
                                                                className="max-w-[160px] h-12 text-center text-xl font-mono tracking-[0.3em] border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl shadow-sm"
                                                                value={verificationCode}
                                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                                maxLength={6}
                                                            />
                                                            <Button
                                                                onClick={handleVerify2FA}
                                                                disabled={verificationCode.length !== 6}
                                                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 shadow-lg shadow-teal-600/20 font-semibold"
                                                            >
                                                                Selesaikan Setup
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-slate-400 hover:text-slate-600 p-0 h-auto text-xs font-semibold"
                                                        onClick={() => setTwoFactorStep("IDLE")}
                                                    >
                                                        Batalkan Setelan
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isPersonal2FAEnabled && (
                                        <div className="mt-6 p-4 bg-teal-50 text-teal-800 rounded-xl flex items-center gap-3 border border-teal-100/50 shadow-sm animate-in fade-in">
                                            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-full shrink-0">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-sm">Hebat! Akun Anda kini terlindungi secara maksimal menggunakan autentikasi ganda (2FA).</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Password Settings */}
                    <TabsContent value="password" className="focus-visible:outline-none focus-visible:ring-0">
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden max-w-xl mx-auto">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8">
                                <CardTitle className="text-2xl text-slate-800">Password</CardTitle>
                                <CardDescription className="text-slate-500">Pastikan akun Anda memakai password unik dan kuat.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Password Saat Ini</Label>
                                        <Input
                                            type="password"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11"
                                            placeholder="Masukkan password saat ini..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Password Baru</Label>
                                        <Input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11"
                                            placeholder="Password baru Anda..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Konfirmasi Password Baru</Label>
                                        <Input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 rounded-xl h-11"
                                            placeholder="Ketik persis seperti password baru..."
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
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
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 shadow-md font-semibold transition-all active:scale-95"
                                    >
                                        {changePasswordMutation.isPending ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Key className="w-5 h-5 mr-2" />
                                        )}
                                        {changePasswordMutation.isPending ? 'Memproses...' : 'Ubah Password'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DoctorProfile;
