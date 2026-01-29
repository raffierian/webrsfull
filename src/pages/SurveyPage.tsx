import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, CheckCircle, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

const departments = [
  "Rawat Jalan",
  "Rawat Inap",
  "IGD",
  "Laboratorium",
  "Radiologi",
  "Farmasi",
  "Administrasi",
];

const questions = [
  { id: "facilities", label: "Fasilitas rumah sakit" },
  { id: "service", label: "Kualitas pelayanan" },
  { id: "cleanliness", label: "Kebersihan lingkungan" },
  { id: "waitTime", label: "Waktu tunggu" },
  { id: "staff", label: "Keramahan petugas" },
];

const SurveyPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    visitDate: "",
    department: "",
    ratings: {} as Record<string, number>,
    recommendation: "",
    feedback: "",
  });

  const handleRating = (questionId: string, rating: number) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, [questionId]: rating },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.department || Object.keys(formData.ratings).length < questions.length) {
      toast({
        title: "Form Belum Lengkap",
        description: "Mohon lengkapi semua penilaian",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: "Terima Kasih!",
      description: "Survei Anda telah berhasil dikirim",
    });
  };

  const StarRating = ({ questionId, rating }: { questionId: string; rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRating(questionId, star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
              }`}
          />
        </button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Terima Kasih!</h2>
                <p className="text-muted-foreground mb-6">
                  Umpan balik Anda sangat berharga bagi kami untuk terus meningkatkan
                  kualitas pelayanan {settings?.name || "RS Soewandhie"}.
                </p>
                <Button onClick={() => { setIsSubmitted(false); setFormData({ name: "", visitDate: "", department: "", ratings: {}, recommendation: "", feedback: "" }); }}>
                  Isi Survei Lagi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Survei Kepuasan Masyarakat</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bantu kami meningkatkan kualitas pelayanan dengan mengisi survei singkat ini.
              Pendapat Anda sangat berarti bagi kami.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Form Survei Kepuasan
              </CardTitle>
              <CardDescription>
                Semua jawaban bersifat anonim dan rahasia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informasi Kunjungan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama (Opsional)</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama Anda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal Kunjungan</Label>
                      <Input
                        type="date"
                        value={formData.visitDate}
                        onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Pelayanan yang Dikunjungi *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(v) => setFormData({ ...formData, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih unit pelayanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Penilaian Kepuasan</h3>
                  <p className="text-sm text-muted-foreground">
                    Berikan penilaian 1-5 bintang (1 = Sangat Tidak Puas, 5 = Sangat Puas)
                  </p>

                  {questions.map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                      <Label className="font-medium">{q.label}</Label>
                      <StarRating questionId={q.id} rating={formData.ratings[q.id] || 0} />
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Rekomendasi</h3>
                  <div className="space-y-3">
                    <Label>Apakah Anda akan merekomendasikan {settings?.name || "RS Soewandhie"} kepada keluarga/teman?</Label>
                    <RadioGroup
                      value={formData.recommendation}
                      onValueChange={(v) => setFormData({ ...formData, recommendation: v })}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="rec-yes" />
                        <Label htmlFor="rec-yes" className="cursor-pointer">Ya, pasti</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="rec-maybe" />
                        <Label htmlFor="rec-maybe" className="cursor-pointer">Mungkin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="rec-no" />
                        <Label htmlFor="rec-no" className="cursor-pointer">Tidak</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Saran & Masukan</h3>
                  <div className="space-y-2">
                    <Label>Tuliskan saran atau masukan Anda (Opsional)</Label>
                    <Textarea
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      placeholder="Bagikan pengalaman atau saran Anda untuk perbaikan pelayanan..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Kirim Survei
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SurveyPage;
