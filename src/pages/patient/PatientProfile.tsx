import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, User, CreditCard, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PatientProfile = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Get initial user from local storage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [formData, setFormData] = useState({
        name: user.name || '',
        nik: user.nik || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.auth.updateProfile(data),
        onSuccess: (updatedUser) => {
            const newUserData = { ...user, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUserData));
            setUser(newUserData);
            toast({ title: "Profil Diperbarui", description: "Data diri Anda berhasil disimpan." });
        },
        onError: () => {
            toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan profil.", variant: "destructive" });
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => api.auth.changePassword(data),
        onSuccess: () => {
            toast({ title: "Password Diperbarui", description: "Password Anda berhasil diubah." });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        },
        onError: (error: any) => {
            toast({ title: "Gagal Memperbarui Password", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Profil Saya</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="profile">Data Profil</TabsTrigger>
                    <TabsTrigger value="password">Ganti Password</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8">
                    {/* Avatar & Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>Detail akun login Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-6">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl">{user.name}</h3>
                                <p className="text-muted-foreground">{user.email}</p>
                                {user.nik && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <CreditCard className="w-3 h-3" />
                                        <span>{user.nik}</span>
                                    </div>
                                )}
                                <Badge variant="outline" className="mt-2">{user.role}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Pribadi</CardTitle>
                            <CardDescription>Perbarui informasi data diri Anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nik">NIK (Nomor Induk Kewarganegaraan)</Label>
                                        <Input
                                            id="nik"
                                            placeholder="16 Kode Angka"
                                            value={formData.nik}
                                            onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">Tanggal Lahir</Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Jenis Kelamin</Label>
                                        <select
                                            id="gender"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="">Pilih...</option>
                                            <option value="MALE">Laki-laki</option>
                                            <option value="FEMALE">Perempuan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Alamat</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ganti Password</CardTitle>
                            <CardDescription>Perbarui password akun Anda secara berkala.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Password Baru</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                <Input
                                    id="confirmPassword"
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

// Quick Badge helper
const Badge = ({ children, variant, className }: any) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'outline' ? 'text-foreground' : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'} ${className}`}>
        {children}
    </span>
);

export default PatientProfile;
