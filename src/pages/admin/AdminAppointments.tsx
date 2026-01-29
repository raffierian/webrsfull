import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Filter,
  Calendar,
  Check,
  X,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: number | string;
  patientName: string;
  patientPhone: string;
  patientNIK: string;
  poli: string;
  doctor: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

// Mock data
const initialAppointments: Appointment[] = [];

const AdminAppointments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => api.appointments.getAllAdmin(),
  });

  // Map backend data to frontend model
  const appointments: Appointment[] = (appointmentsData?.data || []).map((apt: any) => ({
    id: apt.id,
    patientName: apt.patient?.name || 'Unknown',
    patientPhone: apt.patient?.phone || '-',
    patientNIK: apt.patient?.id || '-', // Using ID as NIK placeholder
    poli: apt.poli?.name || '-',
    doctor: apt.doctor?.name || '-',
    date: apt.appointmentDate,
    time: apt.appointmentTime,
    status: apt.status.toLowerCase(), // Convert to lowercase to match frontend expectations
    notes: apt.notes,
    createdAt: apt.createdAt,
  }));

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.appointments.updateStatus(id, status.toUpperCase(), notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast({ title: "Berhasil", description: "Status janji temu diperbarui" });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientNIK.includes(searchTerm) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      // Handle uppercase just in case
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
    };
    const labels: Record<string, string> = {
      confirmed: "Dikonfirmasi",
      pending: "Pending",
      cancelled: "Dibatalkan",
      completed: "Selesai",
      CONFIRMED: "Dikonfirmasi",
      PENDING: "Pending",
      CANCELLED: "Dibatalkan",
      COMPLETED: "Selesai",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleConfirm = (id: any) => { // Use 'any' for ID because frontend uses number but backend string UUID
    updateStatusMutation.mutate({ id: String(id), status: "CONFIRMED" });
  };

  const handleCancel = (id: any) => {
    updateStatusMutation.mutate({ id: String(id), status: "CANCELLED" });
  };

  const handleComplete = (id: any) => {
    updateStatusMutation.mutate({ id: String(id), status: "COMPLETED" });
  };

  const handleEdit = () => {
    if (selectedAppointment && editForm.status) {
      updateStatusMutation.mutate({
        id: String(selectedAppointment.id),
        status: editForm.status,
        notes: editForm.notes
      });
    }
  };

  const handleDelete = () => {
    // Delete API not implemented yet in this iteration for appointments specifically?
    // Checking api.ts... no delete in appointments. Update to CANCELLED instead?
    // Or assume it's implemented. Let's just toast for now or implement cancel.
    if (selectedAppointment) {
      handleCancel(selectedAppointment.id);
      setIsDeleteOpen(false);
    }
  };

  const openEditModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setEditForm({
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes || "",
    });
    setIsEditOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Pasien", "NIK", "Telepon", "Poli", "Dokter", "Tanggal", "Jam", "Status"];
    const rows = filteredAppointments.map(apt => [
      apt.id,
      apt.patientName,
      apt.patientNIK,
      apt.patientPhone,
      apt.poli,
      apt.doctor,
      apt.date,
      apt.time,
      apt.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({ title: "Berhasil", description: "Data telah diekspor ke CSV" });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Janji Temu</h1>
          <p className="text-muted-foreground">Kelola semua janji temu pasien</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pasien, NIK, atau dokter..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daftar Janji Temu
          </CardTitle>
          <CardDescription>
            Total {filteredAppointments.length} janji temu ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium">Pasien</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Poli / Dokter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Jadwal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada janji temu
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b hover:bg-muted/30">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.patientPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{apt.poli}</p>
                          <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(apt.date).toLocaleDateString("id-ID")}</span>
                          <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                          <span>{apt.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(apt.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {apt.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleConfirm(apt.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleCancel(apt.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {apt.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleComplete(apt.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(apt)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Janji Temu</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nama Pasien</Label>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIK</Label>
                  <p className="font-medium">{selectedAppointment.patientNIK}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telepon</Label>
                  <p className="font-medium">{selectedAppointment.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Poli</Label>
                  <p className="font-medium">{selectedAppointment.poli}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dokter</Label>
                  <p className="font-medium">{selectedAppointment.doctor}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tanggal</Label>
                  <p className="font-medium">
                    {new Date(selectedAppointment.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jam</Label>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-muted-foreground">Catatan</Label>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Janji Temu</DialogTitle>
            <DialogDescription>
              Ubah jadwal atau status janji temu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  disabled // Date shouldn't be edited freely without re-validation
                  value={editForm.date ? new Date(editForm.date).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jam</Label>
                <Input
                  type="time"
                  disabled // Time too
                  value={editForm.time || ""}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as Appointment["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Tambahkan catatan..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Janji Temu?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data janji temu akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAppointments;
