import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    User,
    Stethoscope,
    Star,
    Calendar,
    Filter
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DoctorsPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [specializationFilter, setSpecializationFilter] = useState(searchParams.get('specialization') || 'all');

    // Debounce search term for API calls
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (specializationFilter && specializationFilter !== 'all') params.set('specialization', specializationFilter);
        setSearchParams(params);
    }, [debouncedSearch, specializationFilter, setSearchParams]);

    const { data: doctorsData, isLoading } = useQuery({
        queryKey: ['public-doctors', debouncedSearch, specializationFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (specializationFilter !== 'all') params.append('specialization', specializationFilter);
            params.append('isAvailable', 'true'); // Only show available doctors by default? Or all? Let's show all but indicate availability.
            // Actually controller supports isAvailable filter. Let's not filter by default to show all roster.

            return api.doctors.getAllPublic(params.toString());
        }
    });

    const doctors = Array.isArray(doctorsData) ? doctorsData : (doctorsData?.data || []);

    // Extract unique specializations for filter
    // In a real app, we might want a separate endpoint for specializations
    const specializations = React.useMemo(() => {
        const specs = new Set<string>();
        doctors.forEach((doc: any) => {
            if (doc.specialization) specs.add(doc.specialization);
        });
        return Array.from(specs).sort();
    }, [doctors]);

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
                {/* Hero */}
                <section className="py-12 bg-primary text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4">Tim Dokter Kami</h1>
                        <p className="text-white/80 max-w-2xl mx-auto">
                            Berkenalan dengan tim dokter spesialis kami yang berpengalaman dan siap melayani Anda dengan sepenuh hati.
                        </p>
                    </div>
                </section>

                {/* Search & Filter */}
                <section className="py-8 -mt-8">
                    <div className="container mx-auto px-4">
                        <div className="bg-card rounded-xl shadow-lg p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama dokter atau spesialisasi..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            <SelectValue placeholder="Semua Spesialisasi" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Spesialisasi</SelectItem>
                                        {specializations.map((spec) => (
                                            <SelectItem key={spec} value={spec}>
                                                {spec}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Doctors Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {isLoading ? (
                            <div className="text-center py-12">Loading doctors...</div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {doctors.length} Dokter Ditemukan
                                    </h2>
                                </div>

                                {doctors.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Tidak ada dokter yang ditemukan</p>
                                        <p>Coba ubah kata kunci pencarian atau filter Anda.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSpecializationFilter('all');
                                            }}
                                            className="mt-2"
                                        >
                                            Reset Pencarian
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {doctors.map((doctor: any) => (
                                            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                                                <div className="relative h-64 overflow-hidden bg-muted">
                                                    <img
                                                        src={doctor.photoUrl || 'https://via.placeholder.com/400x500?text=No+Image'}
                                                        alt={doctor.name}
                                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                                <CardContent className="p-5 flex flex-col flex-grow">
                                                    <div className="mb-1">
                                                        <Badge variant="secondary" className="mb-2 hover:bg-secondary/20">
                                                            {doctor.specialization}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                                        {doctor.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-yellow-500 mb-3 text-sm">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span className="font-medium">{doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'}</span>
                                                        <span className="text-muted-foreground ml-1">({doctor._count?.reviews || 0} ulasan)</span>
                                                    </div>

                                                    <div className="mt-auto pt-4 space-y-3">
                                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Stethoscope className="w-4 h-4" />
                                                                Pengalaman
                                                            </span>
                                                            <span className="font-medium text-foreground">{doctor.experienceYears || 5} Tahun</span>
                                                        </div>

                                                        <Link to="/appointment" className="block">
                                                            <Button className="w-full gap-2" variant="outline">
                                                                <Calendar className="w-4 h-4" />
                                                                Buat Janji
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default DoctorsPage;
