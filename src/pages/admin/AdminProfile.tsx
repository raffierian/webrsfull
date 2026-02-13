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
    Key,
    Save,
    Smartphone,
    Loader2,
    Eye,
    EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminProfile = () => {
    const { toast } = useToast();
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
    const [twoFactorSecret, setTwoFactorSecret] = useState("");
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
            toast({ title: "Berhasil", description: "Profil berhasil diperbarui" });
            // Update local storage user if needed
            const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
            localStorage.setItem("adminUser", JSON.stringify({ ...adminUser, name: formData.name }));
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
    });

    // Change Password Mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => api.auth.changePassword(data),
        onSuccess: () => {
            toast({ title: "Berhasil", description: "Password berhasil diperbarui" });
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
    });

    // Note: api.users.update might need role permission. 
    // Ideally there should be a dedicated api.auth.updateProfile endpoint.
    // For now, let's assume api.users.update works if backend allows editing self.
    // If backend blocks update, we might need a specific endpoint.

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        });
    };

    // Change Password Logic (Need to verify if backend has this endpoint)
    // Assuming api.auth.changePassword or similar exists. 
    // If not, we might need to rely on users.update with password field if supported.
    // Let's assume we can't easily change password without a dedicated endpoint or checking how backend handles it.
    // Checking admin.controller.js updateUser: it doesn't seem to handle password hashing on update?
    // Actually admin.controller.js updateUser DOES NOT handle password update. 
    // createUser handles password hashing. updateUser does NOT.
    // So Password Change might NOT be implemented in backend yet for Update User.
    // I will just implement Profile Update first and 2FA.

    // 2FA Handlers
    const handleSetup2FA = async () => {
        try {
            const data = await api.auth.setup2FA();
            setQrCodeUrl(data.qrCodeUrl);
            setTwoFactorSecret(data.secret);
            setTwoFactorStep("SETUP");
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleVerify2FA = async () => {
        try {
            await api.auth.verify2FA(verificationCode);
            setIsPersonal2FAEnabled(true);
            setTwoFactorStep("IDLE");
            setVerificationCode("");
            toast({ title: "Berhasil", description: "Google Authenticator berhasil diaktifkan" });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm("Apakah Anda yakin ingin menonaktifkan Google Authenticator?")) return;
        try {
            await api.auth.disable2FA();
            setIsPersonal2FAEnabled(false);
            toast({ title: "Berhasil", description: "Google Authenticator dinonaktifkan" });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
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
                <h1 className="text-3xl font-bold">Profil Saya</h1>
                <p className="text-muted-foreground">Kelola informasi akun dan pengaturan keamanan pribadi anda</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Keamanan (2FA)
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Ganti Password
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>Perbarui nama, email, dan nomor telepon Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input
                                        value={formData.username}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">Username tidak dapat diubah.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nama Lengkap</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nomor Telepon</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                                <Save className="w-4 h-4 mr-2" />
                                {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Keamanan Akun</CardTitle>
                            <CardDescription>Kelola metode autentikasi tambahan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Personal 2FA setup */}
                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Smartphone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Google Authenticator (2FA)</p>
                                        <p className="text-sm text-muted-foreground">Amankan akun Anda dengan verifikasi 2 langkah.</p>
                                    </div>
                                    <div className="ml-auto">
                                        {isPersonal2FAEnabled ? (
                                            <Button variant="outline" className="text-destructive border-destructive" onClick={handleDisable2FA}>
                                                Nonaktifkan
                                            </Button>
                                        ) : twoFactorStep === "IDLE" ? (
                                            <Button onClick={handleSetup2FA}>Aktifkan Sekarang</Button>
                                        ) : null}
                                    </div>
                                </div>

                                {twoFactorStep === "SETUP" && (
                                    <div className="mt-6 space-y-6 pt-6 border-t animate-in fade-in slide-in-from-top-4">
                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                            <div className="bg-white p-4 border rounded-xl shadow-sm">
                                                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-lg">Langkah 1: Scan QR Code</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Buka aplikasi Google Authenticator (atau aplikasi TOTP lainnya),
                                                        lalu scan kode QR di samping.
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-lg">Langkah 2: Masukkan Kode</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Masukkan 6 digit kode dari aplikasi untuk memverifikasi.
                                                    </p>
                                                    <div className="flex gap-2 pt-2">
                                                        <Input
                                                            placeholder="000 000"
                                                            className="max-w-[150px] text-center text-lg font-mono"
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value)}
                                                            maxLength={6}
                                                        />
                                                        <Button onClick={handleVerify2FA} disabled={verificationCode.length !== 6}>
                                                            Verifikasi & Aktifkan
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-xs p-0 h-auto" onClick={() => setTwoFactorStep("IDLE")}>
                                                    Batalkan Setup
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isPersonal2FAEnabled && (
                                    <div className="mt-2 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2 text-sm">
                                        <Shield className="w-4 h-4" />
                                        Google Authenticator telah aktif untuk akun Anda.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Settings */}
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ganti Password</CardTitle>
                            <CardDescription>Demi keamanan, jangan berikan password Anda kepada orang lain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label>Password Saat Ini</Label>
                                <Input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password Baru</Label>
                                <Input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Konfirmasi Password Baru</Label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    if (!formData.currentPassword || !formData.newPassword) {
                                        toast({ title: "Error", description: "Password harus diisi", variant: "destructive" });
                                        return;
                                    }
                                    if (formData.newPassword !== formData.confirmPassword) {
                                        toast({ title: "Error", description: "Konfirmasi password tidak cocok", variant: "destructive" });
                                        return;
                                    }
                                    changePasswordMutation.mutate({
                                        currentPassword: formData.currentPassword,
                                        newPassword: formData.newPassword
                                    });
                                }}
                                disabled={changePasswordMutation.isPending}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                {changePasswordMutation.isPending ? 'Memproses...' : 'Perbarui Password'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminProfile;
