import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Shield } from "lucide-react";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Users,
    Settings,
    Building2,
    DollarSign,
    MessageSquare,
    FolderOpen,
    GraduationCap,
    Megaphone,
    Star,
    Briefcase,
    Globe
} from "lucide-react";

// Define menu items locally to match AdminLayout
// Ideally this should be shared, but for now we duplicate
const allMenuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/content", label: "Konten", icon: Globe },
    { path: "/admin/appointments", label: "Janji Temu", icon: Calendar },
    { path: "/admin/articles", label: "Artikel", icon: FileText },
    { path: "/admin/services", label: "Layanan", icon: Building2 },
    { path: "/admin/doctors", label: "Dokter", icon: Users },
    { path: "/admin/tariffs", label: "Tarif", icon: DollarSign },
    { path: "/admin/inpatient-rooms", label: "Rawat Inap", icon: Building2 },
    { path: "/admin/complaints", label: "Pengaduan", icon: MessageSquare },
    { path: "/admin/ppid", label: "PPID", icon: FolderOpen },
    { path: "/admin/training", label: "Diklat", icon: GraduationCap },
    { path: "/admin/pkrs", label: "PKRS", icon: Megaphone },
    { path: "/admin/survey", label: "Survei SKM", icon: Star },
    { path: "/admin/careers", label: "Karir", icon: Briefcase },
    { path: "/admin/users", label: "Pengguna", icon: Users },
    { path: "/admin/settings", label: "Pengaturan", icon: Settings },
];

const AdminRoleMenus = () => {
    const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
    const queryClient = useQueryClient();

    // Fetch Roles
    const { data: rolesData } = useQuery({
        queryKey: ["roles"],
        queryFn: api.roles.getAll,
    });

    const roles = rolesData?.map((r: any) => ({ value: r.name, label: r.name })) || [];

    // Fetch current permissions for selected role
    const { data: roleMenus, isLoading } = useQuery({
        queryKey: ['role-menus', selectedRole],
        queryFn: () => api.roleMenus.getByRole(selectedRole),
        enabled: !!selectedRole,
    });

    // Mutation to update permissions
    const updateMutation = useMutation({
        mutationFn: (menus: string[]) => api.roleMenus.update(selectedRole, menus),
        onSuccess: () => {
            toast.success("Hak akses menu berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ['role-menus'] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Gagal memperbarui hak akses");
        },
    });

    const handleToggleMenu = (path: string, checked: boolean) => {
        const currentMenus = roleMenus || [];
        let newMenus;
        if (checked) {
            newMenus = [...currentMenus, path];
        } else {
            newMenus = currentMenus.filter((p: string) => p !== path);
        }
        updateMutation.mutate(newMenus);
    };

    const handleSelectAll = () => {
        const allPaths = allMenuItems.map(item => item.path);
        updateMutation.mutate(allPaths);
    };

    const handleDeselectAll = () => {
        updateMutation.mutate([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Akses Menu</h1>
                    <p className="text-muted-foreground">Atur menu yang dapat diakses oleh setiap role</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Konfigurasi Role</CardTitle>
                    <CardDescription>Pilih role dan tentukan menu yang diizinkan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-full md:w-1/3">
                            <Label>Pilih Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 flex justify-end gap-2 mt-auto">
                            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={updateMutation.isPending}>
                                Pilih Semua
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDeselectAll} disabled={updateMutation.isPending}>
                                Hapus Semua
                            </Button>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allMenuItems.map((item) => {
                                    const isChecked = roleMenus?.includes(item.path);
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.path}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${isChecked ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
                                                }`}
                                        >
                                            <Checkbox
                                                id={item.path}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleToggleMenu(item.path, checked as boolean)}
                                                disabled={updateMutation.isPending}
                                            />
                                            <Label
                                                htmlFor={item.path}
                                                className="flex items-center gap-3 cursor-pointer flex-1 font-normal"
                                            >
                                                <div className={`p-2 rounded-md ${isChecked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className={isChecked ? "font-medium" : ""}>{item.label}</span>
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminRoleMenus;
