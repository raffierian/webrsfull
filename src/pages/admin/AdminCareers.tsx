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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Briefcase,
  Users,
  Clock,
  MapPin,
  Eye,
  Download,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: number;
  title: string;
  department: string;
  type: "full_time" | "part_time" | "contract";
  location: string;
  description: string;
  requirements: string;
  salary?: string;
  deadline: string;
  status: "open" | "closed";
  applicants: number;
  createdAt: string;
}

interface Applicant {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  cvUrl: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  appliedAt: string;
}

const initialJobs: Job[] = [
  {
    id: 1,
    title: "Dokter Umum",
    department: "Pelayanan Medis",
    type: "full_time",
    location: "Jakarta",
    description: "Memberikan pelayanan kesehatan umum kepada pasien rawat jalan dan IGD",
    requirements: "S1 Kedokteran, STR aktif, pengalaman min 1 tahun",
    salary: "Rp 15.000.000 - 25.000.000",
    deadline: "2024-02-28",
    status: "open",
    applicants: 12,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    title: "Perawat",
    department: "Keperawatan",
    type: "full_time",
    location: "Jakarta",
    description: "Memberikan asuhan keperawatan kepada pasien rawat inap",
    requirements: "D3/S1 Keperawatan, STR aktif, bersedia shift",
    salary: "Rp 6.000.000 - 10.000.000",
    deadline: "2024-02-15",
    status: "open",
    applicants: 28,
    createdAt: "2024-01-05",
  },
  {
    id: 3,
    title: "Staff IT",
    department: "IT",
    type: "full_time",
    location: "Jakarta",
    description: "Mengelola infrastruktur IT dan aplikasi rumah sakit",
    requirements: "S1 Teknik Informatika, pengalaman 2 tahun",
    deadline: "2024-01-30",
    status: "closed",
    applicants: 15,
    createdAt: "2024-01-01",
  },
];

const initialApplicants: Applicant[] = [
  { id: 1, jobId: 1, name: "dr. Ahmad Fauzi", email: "ahmad@email.com", phone: "081234567890", education: "S1 Kedokteran Universitas Indonesia", experience: "2 tahun di RS Swasta", cvUrl: "/cv/ahmad.pdf", status: "shortlisted", appliedAt: "2024-01-15" },
  { id: 2, jobId: 1, name: "dr. Siti Rahayu", email: "siti@email.com", phone: "081234567891", education: "S1 Kedokteran Universitas Airlangga", experience: "3 tahun di Puskesmas", cvUrl: "/cv/siti.pdf", status: "pending", appliedAt: "2024-01-16" },
  { id: 3, jobId: 2, name: "Dewi Lestari, S.Kep", email: "dewi@email.com", phone: "081234567892", education: "S1 Keperawatan UGM", experience: "1 tahun di RS Pemerintah", cvUrl: "/cv/dewi.pdf", status: "reviewed", appliedAt: "2024-01-12" },
];

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Kontrak" },
];

const AdminCareers = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApplicantDetailOpen, setIsApplicantDetailOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    department: "",
    type: "full_time",
    location: "Jakarta",
    description: "",
    requirements: "",
    salary: "",
    deadline: "",
    status: "open",
  });

  const filteredJobs = jobs.filter((j) => j.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredApplicants = applicants.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusBadge = (status: string, type: "job" | "applicant") => {
    if (type === "job") {
      return status === "open" 
        ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>
        : <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Ditutup</span>;
    }
    const config = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      shortlisted: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      hired: "bg-green-100 text-green-800",
    };
    const labels = { pending: "Pending", reviewed: "Direview", shortlisted: "Shortlist", rejected: "Ditolak", hired: "Diterima" };
    return <span className={`px-2 py-1 text-xs rounded-full ${config[status as keyof typeof config]}`}>{labels[status as keyof typeof labels]}</span>;
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.department || !formData.deadline) {
      toast({ title: "Error", description: "Lengkapi field wajib", variant: "destructive" });
      return;
    }

    if (selectedJob) {
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, ...formData } as Job : j));
      toast({ title: "Berhasil", description: "Lowongan diperbarui" });
    } else {
      const newJob: Job = {
        id: Math.max(...jobs.map(j => j.id)) + 1,
        ...formData as Job,
        applicants: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setJobs(prev => [newJob, ...prev]);
      toast({ title: "Berhasil", description: "Lowongan ditambahkan" });
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedJob) {
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      setIsDeleteOpen(false);
      toast({ title: "Berhasil", description: "Lowongan dihapus" });
    }
  };

  const updateApplicantStatus = (id: number, status: Applicant["status"]) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Berhasil", description: "Status pelamar diperbarui" });
  };

  const resetForm = () => {
    setSelectedJob(null);
    setFormData({
      title: "",
      department: "",
      type: "full_time",
      location: "Jakarta",
      description: "",
      requirements: "",
      salary: "",
      deadline: "",
      status: "open",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Karir & Rekrutmen</h1>
          <p className="text-muted-foreground">Kelola lowongan kerja dan lamaran</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Lowongan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-sm text-muted-foreground">Total Lowongan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === "open").length}</div>
            <p className="text-sm text-muted-foreground">Lowongan Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{applicants.length}</div>
            <p className="text-sm text-muted-foreground">Total Pelamar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{applicants.filter(a => a.status === "shortlisted").length}</div>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Lowongan
            </TabsTrigger>
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pelamar
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Lowongan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          {getStatusBadge(job.status, "job")}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>{job.department}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicants} pelamar</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedJob(job); setFormData({ ...job }); setIsFormOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelectedJob(job); setIsDeleteOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Pelamar</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm">Nama</th>
                      <th className="text-left py-3 px-4 text-sm">Posisi</th>
                      <th className="text-left py-3 px-4 text-sm">Pendidikan</th>
                      <th className="text-left py-3 px-4 text-sm">Status</th>
                      <th className="text-center py-3 px-4 text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((applicant) => {
                      const job = jobs.find(j => j.id === applicant.jobId);
                      return (
                        <tr key={applicant.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-sm text-muted-foreground">{applicant.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{job?.title}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{applicant.education}</td>
                          <td className="py-3 px-4">{getStatusBadge(applicant.status, "applicant")}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedApplicant(applicant); setIsApplicantDetailOpen(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJob ? "Edit Lowongan" : "Tambah Lowongan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul Posisi *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Departemen *</Label>
                <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipe Pekerjaan</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Job["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gaji (Opsional)</Label>
                <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="Rp ..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Persyaratan</Label>
              <Textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{selectedJob ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applicant Detail */}
      <Dialog open={isApplicantDetailOpen} onOpenChange={setIsApplicantDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pelamar</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Nama</Label><p className="font-medium">{selectedApplicant.name}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{selectedApplicant.email}</p></div>
                <div><Label className="text-muted-foreground">Telepon</Label><p className="font-medium">{selectedApplicant.phone}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1">{getStatusBadge(selectedApplicant.status, "applicant")}</div></div>
              </div>
              <div><Label className="text-muted-foreground">Pendidikan</Label><p className="font-medium">{selectedApplicant.education}</p></div>
              <div><Label className="text-muted-foreground">Pengalaman</Label><p className="font-medium">{selectedApplicant.experience}</p></div>
              <div className="space-y-2">
                <Label>Ubah Status</Label>
                <div className="flex flex-wrap gap-2">
                  {["reviewed", "shortlisted", "rejected", "hired"].map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => { updateApplicantStatus(selectedApplicant.id, status as Applicant["status"]); setIsApplicantDetailOpen(false); }}
                    >
                      {status === "reviewed" ? "Direview" : status === "shortlisted" ? "Shortlist" : status === "rejected" ? "Tolak" : "Terima"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Lowongan?</AlertDialogTitle>
            <AlertDialogDescription>Lowongan "{selectedJob?.title}" akan dihapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCareers;
