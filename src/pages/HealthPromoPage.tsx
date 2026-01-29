import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    FileText,
    Image as ImageIcon,
    Video,
    BookOpen,
    ArrowRight,
    Download,
    ExternalLink,
    Loader2
} from 'lucide-react';

const HealthPromoPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    const { data: promosData, isLoading } = useQuery({
        queryKey: ['public-health-promos', selectedType, searchTerm],
        queryFn: () => api.healthPromos.getAllPublic(`type=${selectedType !== 'all' ? selectedType : ''}&search=${searchTerm}`),
    });

    const promos = promosData?.data || [];
    const types = ["all", "LEAFLET", "POSTER", "VIDEO", "BOOKLET"];

    const getIcon = (type: string) => {
        switch (type) {
            case 'LEAFLET': return <FileText className="w-5 h-5" />;
            case 'POSTER': return <ImageIcon className="w-5 h-5" />;
            case 'VIDEO': return <Video className="w-5 h-5" />;
            case 'BOOKLET': return <BookOpen className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getLabel = (type: string) => {
        if (type === 'all') return 'Semua';
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    return (
        <Layout>
            {/* Hero */}
            <section className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm px-4 py-1 text-primary border-primary/20">
                            Media Edukasi
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">Promosi Kesehatan Rumah Sakit</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                            Akses berbagai materi edukasi kesehatan terpercaya berupa leaflet, poster, video, dan booklet.
                        </p>

                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari materi edukasi..."
                                className="pl-10 bg-white shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {types.map((type) => (
                            <Button
                                key={type}
                                variant={selectedType === type ? "default" : "outline"}
                                onClick={() => setSelectedType(type)}
                                className="rounded-full min-w-[100px]"
                            >
                                {getIcon(type)}
                                <span className="ml-2">{getLabel(type)}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {promos.length > 0 ? (
                                promos.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all"
                                    >
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            {item.thumbnailUrl ? (
                                                <img
                                                    src={item.thumbnailUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                                                    {getIcon(item.type)}
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-semibold text-primary shadow-sm flex items-center gap-1">
                                                    {getIcon(item.type)}
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-6 line-clamp-2 h-10">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <Button className="w-full gap-2" variant="outline" asChild>
                                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        {item.type === 'VIDEO' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                        {item.type === 'VIDEO' ? 'Tonton Video' : 'Download / Lihat'}
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Tidak ada materi ditemukan</h3>
                                    <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau kategori Anda.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default HealthPromoPage;
