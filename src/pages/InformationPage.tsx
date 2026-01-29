import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { FileText, Award, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const InformationPage: React.FC = () => {
    const { section } = useParams<{ section: string }>();
    const { t } = useTranslation();

    const { data: tariffsData, isLoading: isTariffsLoading } = useQuery({
        queryKey: ['public-tariffs'],
        queryFn: api.tariffs.getAll,
    });

    const tariffs = (tariffsData as any)?.data || [];

    const formatCurrency = (val: any) => {
        if (val === null || val === undefined) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const renderContent = () => {
        switch (section) {
            case 'standards':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Standar Pelayanan</h2>
                        <p className="text-muted-foreground">
                            Kami berkomitmen untuk memberikan pelayanan kesehatan sesuai dengan standar kualitas nasional dan internasional.
                        </p>
                        {/* Add more static content or fetch from backend if needed */}
                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Maklumat Pelayanan</h3>
                                <p>Menyanggupi Pelayanan Medis yang Cepat, Tepat, dan Akurat.</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Janji Layanan</h3>
                                <p>Melayani dengan Sepenuh Hati (S - Senyum, S - Salam, S - Sapa).</p>
                            </div>
                        </div>
                    </div>
                );
            case 'tariffs':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold">Informasi Tarif</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Transparansi biaya layanan kesehatan di RS Soewandhie.
                        </p>

                        {isTariffsLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                        ) : !tariffs || tariffs.length === 0 ? (
                            <div className="text-center py-20 border rounded-xl bg-muted/30">
                                <p className="text-muted-foreground">Data tarif sedang diperbarui.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Array.from(new Set(tariffs.map((t: any) => t.category))).map((category: any) => (
                                    <div key={category} className="space-y-4">
                                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                            <div className="w-2 h-6 bg-primary rounded-full" />
                                            {category}
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl border">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-4 font-semibold uppercase tracking-wider">Layanan</th>
                                                        {tariffs.find((t: any) => t.category === category && !t.isFlat) ? (
                                                            <>
                                                                <th className="p-4 font-semibold text-center uppercase tracking-wider">Kelas 1</th>
                                                                <th className="p-4 font-semibold text-center uppercase tracking-wider">Kelas 2</th>
                                                                <th className="p-4 font-semibold text-center uppercase tracking-wider">Kelas 3</th>
                                                            </>
                                                        ) : (
                                                            <th className="p-4 font-semibold text-center uppercase tracking-wider">Harga</th>
                                                        )}
                                                        <th className="p-4 font-semibold text-center uppercase tracking-wider font-bold">VIP</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tariffs.filter((t: any) => t.category === category).map((tariff: any) => (
                                                        <tr key={tariff.id} className="border-t hover:bg-muted/30 transition-colors">
                                                            <td className="p-4 font-medium">{tariff.name}</td>
                                                            {tariff.isFlat ? (
                                                                <td className="p-4 text-center font-bold text-blue-600" colSpan={3}>
                                                                    {formatCurrency(tariff.priceFlat)}
                                                                </td>
                                                            ) : (
                                                                <>
                                                                    <td className="p-4 text-center">{formatCurrency(tariff.price1)}</td>
                                                                    <td className="p-4 text-center">{formatCurrency(tariff.price2)}</td>
                                                                    <td className="p-4 text-center">{formatCurrency(tariff.price3)}</td>
                                                                </>
                                                            )}
                                                            <td className="p-4 text-center font-bold text-primary">{formatCurrency(tariff.priceVip)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'innovation':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Inovasi Layanan</h2>
                        <p className="text-muted-foreground">
                            Terus berinovasi demi kenyamanan dan keselamatan pasien.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card-medical p-6">
                                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">E-Medical Record</h3>
                                <p className="text-sm text-muted-foreground">Rekam medis elektronik terintegrasi untuk kecepatan layanan.</p>
                            </div>
                            <div className="card-medical p-6">
                                <Shield className="w-10 h-10 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">Telemedicine</h3>
                                <p className="text-sm text-muted-foreground">Layanan konsultasi online dari rumah Anda.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'sakip':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Dokumen SAKIP</h2>
                        <p className="text-muted-foreground">
                            Sistem Akuntabilitas Kinerja Instansi Pemerintah.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-primary p-2 bg-primary/5 rounded">
                                <FileText className="w-4 h-4" /> Laporan Kinerja 2024 (PDF)
                            </li>
                            <li className="flex items-center gap-2 text-primary p-2 bg-primary/5 rounded">
                                <FileText className="w-4 h-4" /> Perjanjian Kinerja 2025 (PDF)
                            </li>
                            <li className="flex items-center gap-2 text-primary p-2 bg-primary/5 rounded">
                                <FileText className="w-4 h-4" /> Rencana Strategis (Renstra) (PDF)
                            </li>
                        </ul>
                    </div>
                );
            case 'skm':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Survei Kepuasan Masyarakat</h2>
                        <p className="text-muted-foreground">
                            Indeks Kepuasan Masyarakat per Semester.
                        </p>
                        {/* Charts or stats could go here */}
                        <div className="text-center p-8 border rounded-xl bg-primary/5">
                            <div className="text-5xl font-bold text-primary mb-2">89.5</div>
                            <div className="text-lg font-medium">Indeks Kepuasan Masyarakat 2025</div>
                            <div className="text-sm text-muted-foreground">Kategori: Sangat Baik</div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold">Halaman Informasi</h2>
                        <p className="text-muted-foreground">Silakan pilih menu informasi yang tersedia.</p>
                    </div>
                );
        }
    };

    return (
        <Layout>
            <section className="bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto bg-background rounded-2xl shadow-sm border p-8 md:p-12"
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default InformationPage;
