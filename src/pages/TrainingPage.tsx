import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    Filter,
    ArrowRight,
    GraduationCap,
    Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { api } from '@/services/api';

interface Training {
    id: string;
    title: string;
    slug: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string | null;
    maxParticipants: number;
    registeredCount: number;
    imageUrl: string | null;
    skp: number | null;
    jp: number | null;
}

const TrainingPage = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                const data = await api.trainings.getAllPublic();
                setTrainings(data);
            } catch (error) {
                console.error("Failed to fetch trainings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrainings();
    }, []);

    const filteredTrainings = trainings.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-primary/5 py-12 md:py-20 text-blue-900 border-b">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm px-4 py-1 text-primary border-primary/20">
                            Diklat & Pelatihan
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">Pusat Pendidikan & Pelatihan</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                            Tingkatkan kompetensi Anda melalui program pelatihan, seminar, dan workshop terakreditasi Kemkes.
                        </p>

                        <div className="max-w-xl mx-auto flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pelatihan..."
                                    className="pl-10 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">

                    {isLoading ? (
                        <div className="text-center py-20">Memuat data pelatihan...</div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTrainings.map((training, index) => (
                                <motion.div
                                    key={training.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative h-48 overflow-hidden bg-muted">
                                        <img
                                            src={training.imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"}
                                            alt={training.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {training.skp && (
                                                <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-bold shadow-sm">
                                                    {training.skp} SKP
                                                </span>
                                            )}
                                            {training.jp && (
                                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
                                                    {training.jp} JP
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {training.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                            {training.description}
                                        </p>

                                        <div className="space-y-2 text-sm text-muted-foreground mb-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>{new Date(training.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{training.location || "Online"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-orange-600">
                                                <Users className="w-4 h-4" />
                                                <span>Sisa {training.maxParticipants - training.registeredCount} kursi</span>
                                            </div>
                                            <Link to={`/training/${training.slug}`}>
                                                <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary hover:text-white transition-colors">
                                                    Detail <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredTrainings.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Tidak ada pelatihan ditemukan</h3>
                            <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau kategori Anda.</p>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default TrainingPage;
