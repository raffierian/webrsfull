import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Tag,
  MoreHorizontal,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const categories = ['Semua', 'Kesehatan', 'Inovasi', 'Event', 'Prestasi', 'Promosi', 'Edukasi'];

const AdminArticles: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  // Fetch Articles
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => api.articles.getAllAdmin(),
  });

  const articles = Array.isArray(articlesData) ? articlesData : (articlesData?.data || []);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.articles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Artikel berhasil ditambahkan');
      setIsDialogOpen(false);
      setEditingArticle(null);
    },
    onError: (error: any) => toast.error(error.message || 'Gagal menambahkan artikel')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.articles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Artikel berhasil diperbarui');
      setIsDialogOpen(false);
      setEditingArticle(null);
    },
    onError: (error: any) => toast.error(error.message || 'Gagal memperbarui artikel')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.articles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Artikel berhasil dihapus');
    },
    onError: (error: any) => toast.error(error.message || 'Gagal menghapus artikel')
  });

  const statusMutation = useMutation({
    mutationFn: (id: string) => api.articles.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Status artikel diperbarui');
    },
    onError: (error: any) => toast.error(error.message || 'Gagal memperbarui status')
  });


  const filteredArticles = articles.filter((article: any) => {
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'Semua' || article.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'published' ? article.isPublished : !article.isPublished);
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    statusMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;

    // Basic slug generation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload = {
      title,
      slug: editingArticle ? editingArticle.slug : slug, // Keep original slug on edit or allow change? Usually constant.
      category: formData.get('category') as string,
      content: formData.get('content') as string,
      excerpt: (formData.get('content') as string).substring(0, 150) + '...', // Auto excerpt if not provided
      imageUrl: formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', // Default or from input
      // Author is handled by backend based on logged in admin
      tags: ['Kesehatan'], // Simple default, add tag input if needed
    };

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Artikel</h1>
          <p className="text-muted-foreground">Kelola artikel dan berita website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingArticle(null)}>
              <Plus className="w-4 h-4" />
              Tambah Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Artikel *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingArticle?.title}
                  placeholder="Masukkan judul artikel"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select name="category" defaultValue={editingArticle?.category || 'Kesehatan'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'Semua').map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL Gambar (Opsional)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    defaultValue={editingArticle?.imageUrl}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="content">Konten *</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingArticle?.content}
                  placeholder="Tulis konten artikel..."
                  className="min-h-[200px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingArticle ? 'Simpan Perubahan' : 'Tambah Artikel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{articles.length}</div>
          <div className="text-sm text-muted-foreground">Total Artikel</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {articles.filter((a: any) => a.isPublished).length}
          </div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {articles.filter((a: any) => !a.isPublished).length}
          </div>
          <div className="text-sm text-muted-foreground">Draft</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary">
            {articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artikel</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Tidak ada artikel</TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={article.imageUrl || 'https://via.placeholder.com/50'}
                        alt={article.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.author?.name || 'Admin'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={article.isPublished}
                        onCheckedChange={() => handleToggleStatus(article.id)}
                      />
                      <span className={`text-sm ${article.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{(article.views || 0).toLocaleString()}</TableCell>
                  <TableCell>{new Date(article.createdAt || new Date()).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingArticle(article);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminArticles;
