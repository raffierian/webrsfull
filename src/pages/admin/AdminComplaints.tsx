import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Send,
  Download,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: number;
  ticketNumber: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  response?: string;
  createdAt: string;
  updatedAt: string;
}

const initialComplaints: Complaint[] = [
  {
    id: 1,
    ticketNumber: "TKT-2024-0001",
    name: "Ahmad Sudirman",
    email: "ahmad@email.com",
    phone: "081234567890",
    category: "pelayanan",
    subject: "Waktu tunggu terlalu lama",
    message: "Saya menunggu lebih dari 2 jam untuk konsultasi di poli umum. Mohon diperbaiki sistem antriannya.",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
  },
  {
    id: 2,
    ticketNumber: "TKT-2024-0002",
    name: "Siti Rahayu",
    email: "siti@email.com",
    phone: "081234567891",
    category: "fasilitas",
    subject: "AC ruang tunggu tidak berfungsi",
    message: "AC di ruang tunggu lantai 2 tidak dingin, pasien merasa kepanasan.",
    status: "resolved",
    priority: "medium",
    response: "Terima kasih atas laporannya. AC telah diperbaiki oleh tim teknis pada tanggal 14 Januari 2024.",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-14",
  },
  {
    id: 3,
    ticketNumber: "TKT-2024-0003",
    name: "Budi Hartono",
    email: "budi@email.com",
    phone: "081234567892",
    category: "administrasi",
    subject: "Kesalahan tagihan",
    message: "Ada kesalahan pada tagihan rawat jalan saya. Mohon dicek kembali.",
    status: "pending",
    priority: "high",
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
];

const categories = [
  { value: "pelayanan", label: "Pelayanan Medis" },
  { value: "fasilitas", label: "Fasilitas" },
  { value: "administrasi", label: "Administrasi" },
  { value: "kebersihan", label: "Kebersihan" },
  { value: "keamanan", label: "Keamanan" },
  { value: "lainnya", label: "Lainnya" },
];

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

const AdminComplaints = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

  // Fetch Complaints
  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: () => api.complaints.getAllAdmin(),
  });

  const complaints = Array.isArray(complaintsData) ? complaintsData : (complaintsData as any)?.data || [];

  // Respond Mutation (Assumed respond endpoint or update)
  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.complaints.respond(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({ title: "Berhasil", description: "Pengaduan telah direspons" });
      setIsRespondOpen(false);
      setResponseText("");
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.complaints.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({ title: "Berhasil", description: "Pengaduan telah dihapus" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  const filteredComplaints = complaints.filter((c: any) => {
    const matchesSearch =
      (c.ticketNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      c.status === statusFilter ||
      (statusFilter === "PENDING" && (c.status === "NEW" || c.status === "new"));
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: any = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", icon: AlertCircle, label: "Diproses" },
      RESOLVED: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Selesai" },
      REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Ditolak" },
      NEW: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Baru" },
      // Handle mapping from DB values which might be uppercase or different
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
      in_progress: { color: "bg-blue-100 text-blue-800", icon: AlertCircle, label: "Diproses" },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Selesai" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Ditolak" },
      new: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Baru" },
    };
    // Default fallback
    const { color, icon: Icon, label } = config[status] || config['pending'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    // Default low if undefined, handle uppercase from DB
    const p = (priority || 'low').toLowerCase();
    const colors: any = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    };
    const labels: any = { low: "Rendah", medium: "Sedang", high: "Tinggi" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[p] || colors.low}`}>
        {labels[p] || "Normal"}
      </span>
    );
  };

  const handleRespond = () => {
    if (!responseText.trim()) {
      toast({ title: "Error", description: "Mohon isi respons", variant: "destructive" });
      return;
    }

    if (selectedComplaint) {
      respondMutation.mutate({
        id: selectedComplaint.id,
        data: { response: responseText, status: 'RESOLVED' }
      });
    }
  };

  const handleDelete = (id: string, ticketNumber: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengaduan ${ticketNumber}?`)) {
      deleteMutation.mutate(id);
    }
  };


  const stats = {
    total: complaints.length,
    pending: complaints.filter((c: any) => c.status === "PENDING" || c.status === 'pending' || c.status === 'NEW' || c.status === 'new').length,
    inProgress: complaints.filter((c: any) => c.status === "IN_PROGRESS" || c.status === 'in_progress').length,
    resolved: complaints.filter((c: any) => c.status === "RESOLVED" || c.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Pengaduan</h1>
          <p className="text-muted-foreground">Kelola pengaduan dan keluhan masyarakat</p>
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Export", description: "Data diekspor ke Excel" })}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      {/* ... (keep stats UI same but use dynamic stats object) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Pengaduan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">Diproses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari tiket, nama, atau subjek..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">Diproses</SelectItem>
                <SelectItem value="RESOLVED">Selesai</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Daftar Pengaduan
          </CardTitle>
          <CardDescription>{filteredComplaints.length} pengaduan ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div>Loading...</div> : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint: any) => (
                <div key={complaint.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-primary">{complaint.ticketNumber}</span>
                        {getStatusBadge(complaint.status)}
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <h3 className="font-semibold">{complaint.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Dari: {complaint.name}</span>
                        <span>Kategori: {categories.find(c => c.value === complaint.category)?.label || complaint.category}</span>
                        <span>Tanggal: {new Date(complaint.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedComplaint(complaint); setIsDetailOpen(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedComplaint(complaint); setIsRespondOpen(true); }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Respons
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(complaint.id, complaint.ticketNumber)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredComplaints.length === 0 && <div className="text-center py-4">Tidak ada data</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pengaduan</DialogTitle>
            <DialogDescription>{selectedComplaint?.ticketNumber}</DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedComplaint.status)}
                {getPriorityBadge(selectedComplaint.priority)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Nama</Label><p className="font-medium">{selectedComplaint.name}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{selectedComplaint.email}</p></div>
                <div><Label className="text-muted-foreground">Telepon</Label><p className="font-medium">{selectedComplaint.phone}</p></div>
                <div><Label className="text-muted-foreground">Kategori</Label><p className="font-medium">{categories.find(c => c.value === selectedComplaint.category)?.label || selectedComplaint.category}</p></div>
              </div>
              <div>
                <Label className="text-muted-foreground">Subjek</Label>
                <p className="font-medium">{selectedComplaint.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Pesan</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedComplaint.message}</p>
              </div>
              {selectedComplaint.response && (
                <div>
                  <Label className="text-muted-foreground">Respons</Label>
                  <p className="text-sm mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">{selectedComplaint.response}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond Modal */}
      <Dialog open={isRespondOpen} onOpenChange={setIsRespondOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respons Pengaduan</DialogTitle>
            <DialogDescription>{selectedComplaint?.ticketNumber} - {selectedComplaint?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">{selectedComplaint?.message}</div>
            <div className="space-y-2">
              <Label>Respons Anda</Label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Tulis respons untuk pengaduan ini..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRespondOpen(false)}>Batal</Button>
            <Button onClick={handleRespond} disabled={respondMutation.isPending}>
              {respondMutation.isPending ? 'Mengirim...' : 'Kirim Respons'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComplaints;
