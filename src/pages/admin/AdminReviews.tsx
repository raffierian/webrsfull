import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    MessageCircle,
    Star,
    Trash2,
    User,
    Stethoscope,
    Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

const AdminReviews = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch Reviews
    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['admin-reviews', searchTerm],
        queryFn: () => api.reviews.getAllAdmin(searchTerm ? `search=${searchTerm}` : ''),
    });

    const reviews = reviewsData?.reviews || [];

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.reviews.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['public-doctors'] });
            toast({ title: "Berhasil", description: "Ulasan telah dihapus dan rating dokter diperbarui" });
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" })
    });

    const handleDelete = (id: string, doctorName: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ulasan untuk ${doctorName}? Rating dokter akan dihitung ulang.`)) {
            deleteMutation.mutate(id);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Ulasan Dokter</h1>
                    <p className="text-muted-foreground">Lihat dan kelola ulasan pasien untuk tenaga medis</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari ulasan, nama dokter, atau nama pasien..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Daftar Ulasan
                    </CardTitle>
                    <CardDescription>Menampilkan ulasan terbaru dari pasien</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">Memuat ulasan...</div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="p-5 border rounded-xl hover:bg-muted/30 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                {renderStars(review.rating)}
                                                <span className="text-sm font-bold">{review.rating}.0</span>
                                                <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(review.createdAt).toLocaleDateString("id-ID", {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            <p className="text-sm italic text-foreground bg-white/50 p-3 rounded-lg border border-dashed">
                                                "{review.comment || 'Tidak ada komentar'}"
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-primary" />
                                                    </div>
                                                    <span className="text-muted-foreground">Pasien:</span>
                                                    <span className="font-semibold">{review.user?.name}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
                                                        <Stethoscope className="w-3.5 h-3.5 text-secondary" />
                                                    </div>
                                                    <span className="text-muted-foreground">Dokter:</span>
                                                    <span className="font-semibold">{review.doctor?.name}</span>
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                        {review.doctor?.specialization}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(review.id, review.doctor?.name)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {reviews.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">Belum ada ulasan</h3>
                                    <p className="text-muted-foreground">Ulasan akan muncul di sini setelah pasien memberikan penilaian.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReviews;
