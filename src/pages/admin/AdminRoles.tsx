import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Role {
    id: string;
    name: string;
    description?: string;
}

const AdminRoles = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // Fetch Roles
    const { data: roles, isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: api.roles.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => api.roles.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role baru berhasil ditambahkan");
            setIsFormOpen(false);
            resetForm();
        },
        onError: (error: any) => toast.error(error.message || "Gagal menambahkan role"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.roles.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role berhasil diperbarui");
            setIsFormOpen(false);
            resetForm();
        },
        onError: (error: any) => toast.error(error.message || "Gagal memperbarui role"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.roles.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role berhasil dihapus");
            setIsDeleteOpen(false);
            setSelectedRole(null);
        },
        onError: (error: any) => toast.error(error.message || "Gagal menghapus role"),
    });

    const handleSubmit = () => {
        if (!formData.name) {
            toast.error("Nama role wajib diisi");
            return;
        }

        if (selectedRole) {
            updateMutation.mutate({ id: selectedRole.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = () => {
        if (selectedRole) {
            deleteMutation.mutate(selectedRole.id);
        }
    };

    const openEditForm = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || "",
        });
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setSelectedRole(null);
        setFormData({
            name: "",
            description: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Role</h1>
                    <p className="text-muted-foreground">Buat dan kelola role pengguna</p>
                </div>
                <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Role
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Daftar Role
                    </CardTitle>
                    <CardDescription>Role yang tersedia dalam sistem</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">Nama Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">Deskripsi</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles?.map((role: Role) => (
                                        <tr key={role.id} className="border-b hover:bg-muted/30">
                                            <td className="py-4 px-4 font-medium">{role.name}</td>
                                            <td className="py-4 px-4 text-muted-foreground">{role.description || "-"}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditForm(role)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                        disabled={role.name === "SUPER_ADMIN" || role.name === "ADMIN"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedRole ? "Edit Role" : "Tambah Role Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            Buat role baru untuk pengguna sistem
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Role *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                placeholder="CONTOH: HRD"
                            />
                            <p className="text-xs text-muted-foreground">Gunakan huruf kapital, tanpa spasi (gunakan underscore _)</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Deskripsi singkat role ini"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {selectedRole ? "Simpan Perubahan" : "Tambah Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Role "{selectedRole?.name}" akan dihapus.
                            Pastikan tidak ada pengguna yang menggunakan role ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminRoles;
