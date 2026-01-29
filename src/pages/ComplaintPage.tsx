import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

const categories = [
  { value: "pelayanan", label: "Pelayanan Medis" },
  { value: "fasilitas", label: "Fasilitas" },
  { value: "administrasi", label: "Administrasi" },
  { value: "kebersihan", label: "Kebersihan" },
  { value: "keamanan", label: "Keamanan" },
  { value: "lainnya", label: "Lainnya" },
];

const ComplaintPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submit");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: "",
  });
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [trackedComplaint, setTrackedComplaint] = useState<{
    ticketNumber: string;
    status: string;
    subject: string;
    createdAt: string;
    response?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast({ title: "Error", description: "Mohon lengkapi semua field wajib", variant: "destructive" });
      return;
    }

    try {
      const complaint = await api.complaints.create(formData);

      const ticketNumber = `TKT-${new Date().getFullYear()}-${complaint.id.slice(0, 4).toUpperCase()}`;
      setSubmittedTicket(ticketNumber);
      localStorage.setItem(`complaint_${complaint.id}`, ticketNumber);

      toast({
        title: "Pengaduan Terkirim",
        description: `Nomor tiket Anda: ${ticketNumber}`,
      });

      setFormData({ name: "", email: "", phone: "", category: "", subject: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Gagal Mengirim",
        description: error.message || "Terjadi kesalahan saat mengirim pengaduan",
        variant: "destructive"
      });
    }
  };

  const handleTrack = async () => {
    if (!trackingNumber) {
      toast({ title: "Error", description: "Masukkan nomor tiket", variant: "destructive" });
      return;
    }

    try {
      // Extract ID from ticket number (format: TKT-YYYY-XXXX)
      const parts = trackingNumber.split('-');
      if (parts.length !== 3 || !parts[0].startsWith('TKT')) {
        throw new Error('Format nomor tiket tidak valid');
      }

      // Search localStorage for matching ticket
      let complaintId = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('complaint_')) {
          const storedTicket = localStorage.getItem(key);
          if (storedTicket === trackingNumber) {
            complaintId = key.replace('complaint_', '');
            break;
          }
        }
      }

      if (!complaintId) {
        throw new Error('Nomor tiket tidak ditemukan');
      }

      const complaint = await api.complaints.trackById(complaintId);

      setTrackedComplaint({
        ticketNumber: complaint.ticketNumber,
        status: complaint.status,
        subject: complaint.subject,
        createdAt: complaint.createdAt,
        response: complaint.response,
      });
    } catch (error: any) {
      toast({
        title: "Tidak Ditemukan",
        description: error.message || "Nomor tiket tidak valid",
        variant: "destructive"
      });
      setTrackedComplaint(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    const config = {
      pending: { color: "text-yellow-600", icon: Clock, label: "Menunggu" },
      in_progress: { color: "text-blue-600", icon: AlertCircle, label: "Diproses" },
      resolved: { color: "text-green-600", icon: CheckCircle, label: "Selesai" },
    };
    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    return (
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Pengaduan Masyarakat</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sampaikan keluhan, kritik, atau saran Anda untuk peningkatan kualitas pelayanan rumah sakit
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="submit" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Kirim Pengaduan
                </TabsTrigger>
                <TabsTrigger value="track" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Lacak Pengaduan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submit" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Form Pengaduan
                    </CardTitle>
                    <CardDescription>
                      Isi formulir di bawah ini dengan lengkap dan jelas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submittedTicket ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Pengaduan Berhasil Dikirim!</h3>
                        <p className="text-muted-foreground mb-4">
                          Simpan nomor tiket berikut untuk melacak status pengaduan Anda
                        </p>
                        <div className="bg-primary/10 rounded-lg p-4 inline-block">
                          <p className="text-2xl font-mono font-bold text-primary">{submittedTicket}</p>
                        </div>
                        <div className="mt-6">
                          <Button variant="outline" onClick={() => setSubmittedTicket(null)}>
                            Kirim Pengaduan Lain
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Lengkap *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Masukkan nama lengkap"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@contoh.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nomor Telepon</Label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="08xxxxxxxxxx"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kategori *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(v) => setFormData({ ...formData, category: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Subjek Pengaduan *</Label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Ringkasan singkat pengaduan"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Detail Pengaduan *</Label>
                          <Textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Jelaskan pengaduan Anda secara detail..."
                            rows={6}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          <Send className="w-4 h-4 mr-2" />
                          Kirim Pengaduan
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="track" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Lacak Status Pengaduan
                    </CardTitle>
                    <CardDescription>
                      Masukkan nomor tiket untuk melihat status pengaduan Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                        placeholder="Contoh: TKT-2024-0001"
                        className="flex-1"
                      />
                      <Button onClick={handleTrack}>Lacak</Button>
                    </div>

                    {trackedComplaint && (
                      <div className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-lg font-semibold text-primary">
                            {trackedComplaint.ticketNumber}
                          </span>
                          {getStatusDisplay(trackedComplaint.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Subjek</p>
                            <p className="font-medium">{trackedComplaint.subject}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tanggal Pengaduan</p>
                            <p className="font-medium">
                              {new Date(trackedComplaint.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        {trackedComplaint.response && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Respons</p>
                            <p>{trackedComplaint.response}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComplaintPage;
