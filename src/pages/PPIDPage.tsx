import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Search, Calendar, FolderOpen } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const categories = [
  { value: "all", label: "Semua Kategori" },
  { value: "profil", label: "Profil Rumah Sakit" },
  { value: "renstra", label: "Rencana Strategis" },
  { value: "lakip", label: "LAKIP" },
  { value: "anggaran", label: "Anggaran" },
  { value: "pengadaan", label: "Pengadaan" },
  { value: "regulasi", label: "Regulasi" },
  { value: "standar", label: "Standar Pelayanan" },
];

const documents = [
  {
    id: 1,
    title: `Profil RS Soewandhie 2024`,
    category: "profil",
    description: "Dokumen profil lengkap rumah sakit tahun 2024",
    fileSize: "2.5 MB",
    fileType: "PDF",
    year: 2024,
    downloadCount: 156,
    uploadDate: "2024-01-01",
  },
  {
    id: 2,
    title: "Rencana Strategis 2024-2028",
    category: "renstra",
    description: "Dokumen rencana strategis lima tahunan",
    fileSize: "5.2 MB",
    fileType: "PDF",
    year: 2024,
    downloadCount: 89,
    uploadDate: "2024-01-05",
  },
  {
    id: 3,
    title: "LAKIP Tahun 2023",
    category: "lakip",
    description: "Laporan Akuntabilitas Kinerja Instansi Pemerintah",
    fileSize: "8.1 MB",
    fileType: "PDF",
    year: 2023,
    downloadCount: 234,
    uploadDate: "2024-01-10",
  },
  {
    id: 4,
    title: "Standar Pelayanan Minimal",
    category: "standar",
    description: "Dokumen SPM Rumah Sakit",
    fileSize: "1.8 MB",
    fileType: "PDF",
    year: 2024,
    downloadCount: 312,
    uploadDate: "2024-01-15",
  },
  {
    id: 5,
    title: "Rencana Anggaran 2024",
    category: "anggaran",
    description: "Rencana Kerja dan Anggaran tahun 2024",
    fileSize: "3.2 MB",
    fileType: "PDF",
    year: 2024,
    downloadCount: 145,
    uploadDate: "2023-12-20",
  },
  {
    id: 6,
    title: "Peraturan Internal RS",
    category: "regulasi",
    description: "Hospital By Laws dan peraturan internal rumah sakit",
    fileSize: "4.5 MB",
    fileType: "PDF",
    year: 2023,
    downloadCount: 267,
    uploadDate: "2023-06-15",
  },
  {
    id: 7,
    title: "Daftar Informasi Publik",
    category: "profil",
    description: "Daftar informasi yang dapat diakses publik",
    fileSize: "1.2 MB",
    fileType: "PDF",
    year: 2024,
    downloadCount: 98,
    uploadDate: "2024-01-02",
  },
  {
    id: 8,
    title: "Laporan Pengadaan Barang 2023",
    category: "pengadaan",
    description: "Rekap pengadaan barang dan jasa tahun 2023",
    fileSize: "6.7 MB",
    fileType: "PDF",
    year: 2023,
    downloadCount: 76,
    uploadDate: "2024-01-20",
  },
];

const PPIDPage = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesYear = yearFilter === "all" || doc.year === parseInt(yearFilter);
    return matchesSearch && matchesCategory && matchesYear;
  });

  const years = [...new Set(documents.map(d => d.year))].sort((a, b) => b - a);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">PPID</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pejabat Pengelola Informasi dan Dokumentasi - Akses informasi publik
              {settings?.name || "RS Soewandhie"} secara transparan dan akuntabel
            </p>
          </div>
        </section>

        {/* Info Section */}
        <section className="pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Informasi Publik</h3>
                  <p className="text-sm text-muted-foreground">
                    Akses dokumen dan informasi yang tersedia untuk masyarakat
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Transparansi</h3>
                  <p className="text-sm text-muted-foreground">
                    Keterbukaan informasi sesuai UU No. 14 Tahun 2008
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Unduh Gratis</h3>
                  <p className="text-sm text-muted-foreground">
                    Semua dokumen dapat diunduh secara gratis
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Daftar Dokumen Informasi Publik</h2>

            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari dokumen..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="px-2 py-1 bg-muted rounded">
                              {categories.find(c => c.value === doc.category)?.label}
                            </span>
                            <span>{doc.fileType} • {doc.fileSize}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(doc.uploadDate).toLocaleDateString("id-ID")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {doc.downloadCount} unduhan
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button className="flex-shrink-0">
                        <Download className="w-4 h-4 mr-2" />
                        Unduh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada dokumen yang sesuai dengan pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact PPID */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Hubungi PPID</CardTitle>
                <CardDescription>
                  Untuk permohonan informasi yang tidak tersedia di halaman ini
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Anda dapat mengajukan permohonan informasi melalui:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{settings?.email || "ppid@rs-soewandhie.com"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Telepon</p>
                    <p className="text-muted-foreground">{settings?.phone || "(031) 3717141"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jam operasional: Senin - Jumat, 08:00 - 16:00 WIB
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PPIDPage;
