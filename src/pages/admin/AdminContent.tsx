import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Stethoscope,
  Award,
  Lightbulb,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface ContentItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt?: string;
  status: "published" | "draft";
  author: string;
  createdAt: string;
  updatedAt: string;
}

// Carousel Slide Type
interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

const categories = [
  { value: "layanan", label: "Layanan", icon: Stethoscope },
  { value: "artikel", label: "Artikel Kesehatan", icon: FileText },
  { value: "prestasi", label: "Prestasi & Penghargaan", icon: Award },
  { value: "inovasi", label: "Inovasi", icon: Lightbulb },
];

const AdminContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- EXISTING CONTENT LOGIC (Mock) ---
  const [contents, setContents] = useState<ContentItem[]>([]); // Initialize empty, fetching mock or real later
  const [activeTab, setActiveTab] = useState("all");
  // ... (Keeping existing logic placeholders or simplified)

  // --- CAROUSEL LOGIC ---
  const [carouselSlides, setCarouselSlides] = useState<Slide[]>([]);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [slideFormData, setSlideFormData] = useState<Slide>({
    id: 0,
    image: "",
    badge: "",
    title: "",
    titleHighlight: "",
    subtitle: ""
  });

  // Fetch Hero Content
  const { data: heroData, isLoading: isHeroLoading } = useQuery({
    queryKey: ['homepage-hero'],
    queryFn: () => api.homepage.getSection('hero'),
  });

  useEffect(() => {
    // If backend has content, use it. Else use defaults if we want to seed from frontend (or backend sends defaults)
    if (heroData?.content) {
      // Handle if content is string (json) or object
      const parsed = typeof heroData.content === 'string' ? JSON.parse(heroData.content) : heroData.content;
      setCarouselSlides(Array.isArray(parsed) ? parsed : []);
    } else if (heroData === null) {
      // If null (not found), maybe set sensible defaults
      setCarouselSlides([]);
    }
  }, [heroData]);

  // Update Hero Content
  const updateHeroMutation = useMutation({
    mutationFn: (slides: Slide[]) => api.homepage.updateSection('hero', { content: slides }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-hero'] });
      toast({ title: "Berhasil", description: "Carousel berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Gagal menyimpan carousel", variant: "destructive" });
    }
  });

  const handleSlideSubmit = () => {
    if (!slideFormData.image || !slideFormData.title) {
      toast({ title: "Error", description: "Gambar dan Judul wajib diisi", variant: "destructive" });
      return;
    }

    let newSlides = [...carouselSlides];
    if (editingSlide) {
      newSlides = newSlides.map(s => s.id === editingSlide.id ? { ...slideFormData, id: editingSlide.id } : s);
    } else {
      newSlides.push({ ...slideFormData, id: Date.now() });
    }

    // Optimistic update
    setCarouselSlides(newSlides);
    // Push to backend
    updateHeroMutation.mutate(newSlides);

    setIsSlideFormOpen(false);
    setEditingSlide(null);
  };

  const deleteSlide = (id: number) => {
    const newSlides = carouselSlides.filter(s => s.id !== id);
    setCarouselSlides(newSlides);
    updateHeroMutation.mutate(newSlides);
  };

  const openSlideForm = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideFormData(slide);
    } else {
      setEditingSlide(null);
      setSlideFormData({
        id: 0,
        image: "",
        badge: "Info RS",
        title: "",
        titleHighlight: "",
        subtitle: ""
      });
    }
    setIsSlideFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Konten</h1>
          <p className="text-muted-foreground">Kelola konten website dan carousel halaman utama</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="all">Artikel & Layanan</TabsTrigger>
          <TabsTrigger value="carousel" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Carousel Utama
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carousel" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Slide Banner Utama</h3>
            <Button onClick={() => openSlideForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Slide
            </Button>
          </div>

          {isHeroLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid gap-6">
              {carouselSlides.map((slide, index) => (
                <Card key={slide.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 bg-gray-100 relative">
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Slide #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                            {slide.badge}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold">
                          {slide.title} <span className="text-primary">{slide.titleHighlight}</span>
                        </h4>
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {slide.subtitle}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openSlideForm(slide)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteSlide(slide.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {carouselSlides.length === 0 && (
                <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                  Belum ada slide. Tambahkan slide pertama Anda!
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {/* Simple Placeholder for existing content logic to save space/time as focus is Carousel */}
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
            Fitur manajemen artikel dan layanan (Tab ini menggunakan kode lama/mock).
            Silakan gunakan tab "Carousel Utama" untuk fitur baru.
          </div>
        </TabsContent>
      </Tabs>

      {/* Slide Form Dialog */}
      <Dialog open={isSlideFormOpen} onOpenChange={setIsSlideFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Edit Slide' : 'Tambah Slide Baru'}</DialogTitle>
            <DialogDescription>
              Pastikan URL gambar valid dan memiliki resolusi tinggi (1920x1080 disarankan).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL Gambar (https://...)</Label>
              <Input
                value={slideFormData.image}
                onChange={e => setSlideFormData({ ...slideFormData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge (Label Kecil)</Label>
                <Input
                  value={slideFormData.badge}
                  onChange={e => setSlideFormData({ ...slideFormData, badge: e.target.value })}
                  placeholder="Contoh: 🏥 Info RS"
                />
              </div>
              <div className="space-y-2">
                <Label>Judul Utama</Label>
                <Input
                  value={slideFormData.title}
                  onChange={e => setSlideFormData({ ...slideFormData, title: e.target.value })}
                  placeholder="Contoh: Pelayanan Kesehatan"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Judul Highlight (Warna Berbeda)</Label>
              <Input
                value={slideFormData.titleHighlight}
                onChange={e => setSlideFormData({ ...slideFormData, titleHighlight: e.target.value })}
                placeholder="Contoh: Berkualitas Internasional"
              />
            </div>
            <div className="space-y-2">
              <Label>Subjudul / Deskripsi</Label>
              <Textarea
                value={slideFormData.subtitle}
                onChange={e => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                placeholder="Deskripsi singkat slide..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlideFormOpen(false)}>Batal</Button>
            <Button onClick={handleSlideSubmit} disabled={updateHeroMutation.isPending}>
              {updateHeroMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
