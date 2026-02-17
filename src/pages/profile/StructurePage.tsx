import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Users, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const StructurePage: React.FC = () => {
    const { settings, isLoading } = useSettings();
    const orgStructure = settings?.org_structure || { leaders: [], divisions: [] };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" as any }
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-primary">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/2 translate-y-1/2 blur-3xl animate-pulse" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm border border-white/10">
                                Tata Kelola Organisasi
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                                Struktur <span className="text-white/70">Organisasi</span>
                            </h1>
                            <p className="text-lg text-white/80 leading-relaxed font-medium">
                                Sinergi dan integrasi seluruh lini komando untuk mewujudkan pelayanan kesehatan yang prima dan profesional.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <div className="container mx-auto px-4 -mt-10 pb-24 relative z-20">
                    {isLoading ? (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-96 rounded-[2rem] bg-white shadow-xl" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-24"
                        >
                            {/* Leadership Section */}
                            {orgStructure.leaders.length > 0 && (
                                <section>
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Dewan Direksi</h2>
                                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                        {orgStructure.leaders.map((leader: any, idx: number) => (
                                            <motion.div
                                                key={leader.id}
                                                variants={itemVariants as any}
                                                className="group"
                                            >
                                                <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                                                    {/* Image Section with Orb Glow */}
                                                    <div className="relative h-80 overflow-hidden bg-slate-50">
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent z-10" />
                                                        <img
                                                            src={leader.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'}
                                                            alt={leader.name}
                                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                                        />

                                                        {/* Decorative Orb */}
                                                        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                                            <Award className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="p-8 flex flex-col flex-grow text-center relative">
                                                        {/* Glass Accent */}
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 bg-white/90 backdrop-blur-md py-4 px-6 rounded-2xl shadow-lg border border-slate-100 z-20 group-hover:-top-14 transition-all duration-500">
                                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                                {leader.name}
                                                            </h3>
                                                            <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">
                                                                {leader.title}
                                                            </p>
                                                        </div>

                                                        <div className="mt-8">
                                                            <p className="text-slate-500 text-sm leading-relaxed italic">
                                                                "{leader.bio || 'Melayani masyarakat dengan dedikasi dan integritas tinggi untuk Surabaya yang lebih sehat.'}"
                                                            </p>
                                                        </div>

                                                        <div className="mt-auto pt-6 flex items-center justify-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Dalam Tugas Aktif</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Divisions Section */}
                            {orgStructure.divisions.length > 0 && (
                                <section>
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Divisi & Instalasi</h2>
                                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                                        {orgStructure.divisions.map((div: any, idx: number) => (
                                            <motion.div
                                                key={div.id}
                                                variants={itemVariants}
                                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                        <Users className="w-7 h-7 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900">{div.name}</h3>
                                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unit Kerja Pelayanan</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {div.members.map((member: any, mIdx: number) => (
                                                        <div key={mIdx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors group/member">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/member:bg-primary transition-colors" />
                                                                <div>
                                                                    <p className="font-bold text-slate-700 text-sm">{member.name}</p>
                                                                    <p className="text-xs text-slate-400 font-medium">{member.title}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover/member:text-primary transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Empty State */}
                            {orgStructure.leaders.length === 0 && orgStructure.divisions.length === 0 && (
                                <div className="max-w-md mx-auto text-center py-20 bg-white rounded-[3rem] shadow-xl border border-slate-100">
                                    <ShieldCheck className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Data Belum Tersedia</h3>
                                    <p className="text-slate-500 text-sm px-8">
                                        Informasi mengenai struktur organisasi sedang dalam tahap pemutakhiran data.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default StructurePage;
