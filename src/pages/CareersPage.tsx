import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Search,
  Upload,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

const CareersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
  });

  // Fetch Careers
  const { data: careersData, isLoading } = useQuery({
    queryKey: ['public-careers'],
    queryFn: () => api.careers.getAllPublic(),
  });

  const jobs = careersData || [];

  const filteredJobs = jobs.filter(
    (job: any) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Apply Mutation
  const mutation = useMutation({
    mutationFn: (data: any) => api.careers.apply(data),
    onSuccess: () => {
      setIsApplyOpen(false);
      setIsSuccessOpen(true);
      setFormData({ name: "", email: "", phone: "", education: "", experience: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal mengirim lamaran", variant: "destructive" });
    }
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Mohon lengkapi data diri", variant: "destructive" });
      return;
    }

    if (!selectedJob) return;

    // Map education and experience to coverLetter as backend expects coverLetter
    const coverLetter = `Pendidikan: ${formData.education}\nPengalaman: ${formData.experience}`;

    mutation.mutate({
      careerId: selectedJob.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      coverLetter: coverLetter,
      // File upload ignored for now as backend controller doesn't seem to handle multipart in the snippet provided
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Karir di {settings?.name || "RS Soewandhie"}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Bergabunglah dengan tim profesional kami dan berkontribusi dalam memberikan
              pelayanan kesehatan terbaik untuk masyarakat
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari posisi atau departemen..."
                className="pl-12 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Lowongan Tersedia</h2>
              <p className="text-muted-foreground">{filteredJobs.length} posisi ditemukan</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading jobs...</div>
            ) : (
              <div className="grid gap-6">
                {filteredJobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">{job.title}</h3>
                              <p className="text-muted-foreground">{job.department || 'Umum'}</p>
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location || 'Surabaya'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString("id-ID") : 'Open'}
                                </span>
                              </div>
                              <p className="mt-3 text-sm">{job.description}</p>
                              {job.requirements && Array.isArray(job.requirements) && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">Persyaratan:</p>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {job.requirements.map((req: string, idx: number) => (
                                      <li key={idx}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {job.salaryRange && (
                                <p className="mt-3 text-primary font-medium">{job.salaryRange}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          className="lg:self-start"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsApplyOpen(true);
                          }}
                        >
                          Lamar Sekarang
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada lowongan yang sesuai dengan pencarian Anda</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Apply Modal */}
        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lamar Posisi: {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Lengkapi data diri Anda
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama sesuai KTP"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@contoh.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telepon *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pendidikan Terakhir</Label>
                <Input
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="S1 Kedokteran - Universitas Indonesia"
                />
              </div>
              <div className="space-y-2">
                <Label>Ringkasan Pengalaman</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ceritakan pengalaman kerja Anda..."
                  rows={3}
                />
              </div>
              {/* File upload temporarily hidden as backend needs to support it */}

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsApplyOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>) : "Kirim Lamaran"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
          <DialogContent className="max-w-md text-center">
            <div className="py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lamaran Terkirim!</h3>
              <p className="text-muted-foreground mb-4">
                Terima kasih telah melamar posisi <strong>{selectedJob?.title}</strong>.
                Tim HR kami akan meninjau lamaran Anda dan menghubungi jika Anda lolos seleksi awal.
              </p>
              <Button onClick={() => setIsSuccessOpen(false)}>Tutup</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CareersPage;
