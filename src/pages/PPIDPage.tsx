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

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

// ... categories constant remains ...

const PPIDPage = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  // Year filter disabled for now as API doesn't support complex date filtering yet
  // const [yearFilter, setYearFilter] = useState("all");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['public-ppid', categoryFilter, searchTerm],
    queryFn: () => api.ppid.getAll({
      isPublic: true,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      search: searchTerm
    })
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Extract years dynamically if needed, or rely on API date filtering in future
  // For now we don't filter by year on client side to avoid confusion with server pagination if implemented later


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
                  {/* Year filter temporarily hidden until API supports it */}
                  {/*
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                       <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                  */}
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></div>
              ) : documents.length > 0 ? (
                documents.map((doc: any) => (
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
                                {categories.find(c => c.value === doc.category)?.label || doc.category}
                              </span>
                              <span>{doc.fileType} • {formatFileSize(doc.fileSize)}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button className="flex-shrink-0" onClick={() => window.open(doc.fileUrl, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Unduh
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
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
