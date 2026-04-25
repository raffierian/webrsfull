import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Power, PowerOff, Search, Copy, Check, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/services/api';

export default function AdminDoctorAccounts() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<any>(null);
    const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
    const [copiedField, setCopiedField] = useState<string>('');
    const [toggleDialog, setToggleDialog] = useState<{ open: boolean; doctor: any | null }>({ open: false, doctor: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; doctor: any | null }>({ open: false, doctor: null });
    const [resetDialog, setResetDialog] = useState<{ open: boolean; doctor: any | null }>({ open: false, doctor: null });

    // Fetch doctors
    const { data: response, isLoading } = useQuery({
        queryKey: ['admin-doctor-accounts'],
        queryFn: () => api.adminDoctors.getAll()
    });

    console.log('API Response:', response);
    console.log('Doctors data:', response?.data);

    // API returns array directly, not { data: [...] }
    const doctors = Array.isArray(response) ? response : (response?.data || []);
    console.log('Doctors array:', doctors);

    // Create doctor mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => api.adminDoctors.create(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['admin-doctor-accounts'] });
            setFormOpen(false);
            // Backend returns { success: true, data: { doctor: {...}, credentials: {...} } }
            const credentials = response?.data?.credentials || response?.credentials;
            setGeneratedCredentials(credentials);
            setCredentialsOpen(true);
            toast.success('Doctor account created successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create doctor');
        }
    });

    // Update doctor mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.adminDoctors.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-doctor-accounts'] });
            setFormOpen(false);
            setEditingDoctor(null);
            toast.success('Doctor updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update doctor');
        }
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => api.adminDoctors.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-doctor-accounts'] });
            setToggleDialog({ open: false, doctor: null });
            toast.success('Doctor status updated!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update status');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.adminDoctors.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-doctor-accounts'] });
            setDeleteDialog({ open: false, doctor: null });
            toast.success('Doctor deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete doctor');
        }
    });

    // Reset password mutation
    const resetPasswordMutation = useMutation({
        mutationFn: (id: string) => api.adminDoctors.resetPassword(id),
        onSuccess: (response: any) => {
            setResetDialog({ open: false, doctor: null });

            // Backend returns { username: '...', password: '...' } inside data or root
            const credentials = response?.data || response;
            setGeneratedCredentials(credentials);
            setCredentialsOpen(true);
            toast.success('Password reset successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to reset password');
        }
    });


    // Filter doctors
    const filteredDoctors = doctors.filter((doctor: any) =>
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name') as string,
            specialization: formData.get('specialization') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            username: formData.get('username') as string,
        };

        if (editingDoctor) {
            updateMutation.mutate({ id: editingDoctor.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopiedField(field);
                    setTimeout(() => setCopiedField(''), 2000);
                    toast.success('Copied to clipboard!');
                })
                .catch(() => {
                    fallbackCopy(text, field);
                });
        } else {
            fallbackCopy(text, field);
        }
    };

    const fallbackCopy = (text: string, field: string) => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedField(field);
            setTimeout(() => setCopiedField(''), 2000);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy. Please copy manually.');
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Doctor Accounts</h1>
                    <p className="text-muted-foreground">Manage doctor login accounts and credentials</p>
                </div>
                <Button onClick={() => { setEditingDoctor(null); setFormOpen(true); }} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Doctor Account
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Doctors</CardTitle>
                    <CardDescription>Find by name, specialization, email, or username</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search doctors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Doctors Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Doctor Accounts ({filteredDoctors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'No doctors found' : 'No doctor accounts yet. Create one to get started!'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Specialization</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDoctors.map((doctor: any) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-medium">{doctor.name}</TableCell>
                                            <TableCell>{doctor.specialization}</TableCell>
                                            <TableCell>{doctor.email}</TableCell>
                                            <TableCell>{doctor.phone}</TableCell>
                                            <TableCell className="font-mono text-sm">{doctor.username}</TableCell>
                                            <TableCell>
                                                <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                                                    {doctor.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingDoctor(doctor);
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setToggleDialog({ open: true, doctor })}
                                                    >
                                                        {doctor.isActive ? (
                                                            <PowerOff className="w-4 h-4 text-destructive" />
                                                        ) : (
                                                            <Power className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, doctor })}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-orange-500 hover:text-orange-600"
                                                        title="Reset Password"
                                                        onClick={() => setResetDialog({ open: true, doctor })}
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingDoctor(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Create Doctor Account'}</DialogTitle>
                        <DialogDescription>
                            {editingDoctor ? 'Update doctor information' : 'Username and password will be auto-generated'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={editingDoctor?.name}
                                placeholder="Dr. John Doe"
                                required
                            />
                            {!editingDoctor && (
                                <p className="text-xs text-muted-foreground">
                                    Username will be: <span className="font-mono">dr.{(document.getElementById('name') as HTMLInputElement)?.value?.split(' ')[0]?.toLowerCase() || 'firstname'}</span>
                                </p>
                            )}
                            {editingDoctor && (
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        defaultValue={editingDoctor?.username}
                                        placeholder="dr.johndoe"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        You can modify the username
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization *</Label>
                            <Input
                                id="specialization"
                                name="specialization"
                                defaultValue={editingDoctor?.specialization}
                                placeholder="Dokter Umum"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={editingDoctor?.email}
                                placeholder="doctor@hospital.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={editingDoctor?.phone}
                                placeholder="08123456789"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingDoctor ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Credentials Dialog */}
            <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Doctor Account Created!</DialogTitle>
                        <DialogDescription>
                            Save these credentials - they won't be shown again
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium text-yellow-900">⚠️ Important</p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Copy and share these credentials with the doctor. They cannot be retrieved later.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>Username</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={generatedCredentials?.username || ''}
                                        readOnly
                                        className="font-mono"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(generatedCredentials?.username, 'username')}
                                    >
                                        {copiedField === 'username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Temporary Password</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={generatedCredentials?.password || ''}
                                        readOnly
                                        className="font-mono"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(generatedCredentials?.password, 'password')}
                                    >
                                        {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setCredentialsOpen(false)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Toggle Status Dialog */}
            <AlertDialog open={toggleDialog.open} onOpenChange={(open) => setToggleDialog({ open, doctor: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {toggleDialog.doctor?.isActive ? 'Deactivate' : 'Activate'} Doctor Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {toggleDialog.doctor?.isActive ? (
                                <>This will prevent <strong>{toggleDialog.doctor?.name}</strong> from logging in. Consultation history will be preserved.</>
                            ) : (
                                <>This will allow <strong>{toggleDialog.doctor?.name}</strong> to login again.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toggleDialog.doctor && toggleStatusMutation.mutate(toggleDialog.doctor.id)}>
                            {toggleDialog.doctor?.isActive ? 'Deactivate' : 'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, doctor: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Doctor Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteDialog.doctor?.name}</strong>'s account and user login.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialog.doctor && deleteMutation.mutate(deleteDialog.doctor.id)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Confirmation Dialog */}
            <AlertDialog open={resetDialog.open} onOpenChange={(open) => setResetDialog({ open, doctor: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will generate a new randomized password for <strong>{resetDialog.doctor?.name}</strong> and immediately overwrite the old one.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => resetDialog.doctor && resetPasswordMutation.mutate(resetDialog.doctor.id)}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            Reset Password
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
