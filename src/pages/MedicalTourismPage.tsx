import Layout from "@/components/layout/Layout";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    CheckCircle, MessageCircle, Phone, MapPin,
    ArrowRight, Star, Heart, FileText, Calendar,
    Shield, Activity, Zap, Users
} from "lucide-react";
import * as Icons from "lucide-react";

// Helper to render dynamic lucide icons
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // @ts-ignore
    const IconComponent = Icons[name] || Icons.CheckCircle;
    return <IconComponent className={className} />;
};

const MedicalTourismPage = () => {
    const { settings } = useSettings();
    const mtData = settings.medical_tourism || {};

    const hero = mtData.hero || {
        title: "Medical Tourism di RSUD dr. M. Soewandhie",
        subtitle: "Layanan kesehatan bertaraf internasional dengan fasilitas lengkap dan dokter spesialis berpengalaman. Kami siap melayani pasien dari seluruh penjuru negeri dan mancanegara.",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
    };

    const whyUs = mtData.whyUs || [];
    const excellence = mtData.centersOfExcellence || [];
    const packages = mtData.packages || [];
    const process = mtData.process || [];
    const testimonials = mtData.testimonials || [];
    const facilities = mtData.facilities || [];
    const faqContact = mtData.contact || { faqs: [], contactInfo: {} };
    const { faqs = [], contactInfo = {} } = faqContact;

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={hero.image}
                        alt={hero.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-800/70" />
                </div>
                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl text-white">
                        <span className="inline-block py-1 px-3 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-100 text-sm font-semibold mb-6 animate-fade-in">
                            Layanan Unggulan
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" dangerouslySetInnerHTML={{ __html: hero.title }} />
                        <p className="text-lg md:text-xl text-teal-50 mb-8 animate-fade-in-up" dangerouslySetInnerHTML={{ __html: hero.subtitle }} />
                        <div className="flex flex-wrap gap-4 animate-fade-in-up">
                            <Button size="lg" className="bg-white text-teal-900 hover:bg-gray-100" onClick={() => window.location.href = '#contact'}>
                                Hubungi Kami Sekarang
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 hover:text-white" onClick={() => window.location.href = '#packages'}>
                                Lihat Paket Medis
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            {whyUs.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami?</h2>
                            <p className="text-gray-600">Berbagai alasan mengapa RSUD dr. M. Soewandhie adalah pilihan tepat untuk perawatan medis Anda.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {whyUs.map((item: any, index: number) => (
                                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white pointer-events-none">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mx-auto mb-6">
                                            <DynamicIcon name={item.icon} className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Centers of Excellence */}
            {excellence.length > 0 && (
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pusat Keunggulan</h2>
                                <p className="text-gray-600">Layanan spesialis prioritas kami yang didukung oleh tenaga ahli terbaik dan teknologi medis terdepan.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {excellence.map((item: any, index: number) => (
                                <div key={index} className="flex flex-col md:flex-row bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="w-full md:w-2/5 h-64 md:h-auto">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-center">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                        <p className="text-gray-600 mb-6">{item.description}</p>
                                        <ul className="space-y-2 mb-6">
                                            {item.features?.map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-700">
                                                    <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Medical Packages */}
            {packages.length > 0 && (
                <section id="packages" className="py-20 bg-teal-900 text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold mb-4">Paket Wisata Medis</h2>
                            <p className="text-teal-100">Pilihan paket pemeriksaan menyeluruh yang dirancang khusus untuk kenyamanan dan kebutuhan Anda selama berwisata medis.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg: any, index: number) => (
                                <div key={index} className="bg-white rounded-2xl overflow-hidden text-gray-900 flex flex-col">
                                    <div className="h-48 relative">
                                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <h3 className="absolute bottom-4 left-6 right-6 text-xl font-bold text-white">{pkg.name}</h3>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        {pkg.price && (
                                            <div className="mb-6 pb-6 border-b">
                                                <p className="text-sm text-gray-500 mb-1">Estimasi Biaya</p>
                                                <p className="text-2xl font-bold text-teal-600">{pkg.price}</p>
                                            </div>
                                        )}
                                        <h4 className="font-semibold mb-4 flex items-center">
                                            <Activity className="w-5 h-5 text-teal-500 mr-2" /> Yang Anda Dapatkan:
                                        </h4>
                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {pkg.inclusions?.map((inc: string, idx: number) => (
                                                <li key={idx} className="flex items-start text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    {inc}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.location.href = '#contact'}>
                                            Reservasi Paket
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Patient Journey Process */}
            {process.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Alur Pelayanan (Patient Journey)</h2>
                            <p className="text-gray-600">Langkah mudah untuk mendapatkan perawatan bersama kami, dari awal hingga pemulihan secara berurutan.</p>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            {process.sort((a: any, b: any) => a.step - b.step).map((step: any, index: number) => (
                                <div key={index} className="flex relative pb-12 last:pb-0 group">
                                    {index !== process.length - 1 && (
                                        <div className="absolute top-10 bottom-0 left-[2rem] w-[2px] bg-teal-100 group-hover:bg-teal-200 transition-colors" />
                                    )}
                                    <div className="w-16 h-16 rounded-full bg-white border-4 border-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl relative z-10 shadow-sm flex-shrink-0">
                                        <DynamicIcon name={step.icon} className="w-6 h-6" />
                                    </div>
                                    <div className="pl-8 pt-3 pb-2 pt-4 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.step}. {step.title}</h3>
                                        <p className="text-gray-600 bg-white p-4 rounded-xl border shadow-sm">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ and Contact Section */}
            <section id="contact" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* FAQ */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Pertanyaan Umum (FAQ)</h2>
                            <div className="space-y-4">
                                {faqs.map((faq: any, index: number) => (
                                    <details key={index} className="group border rounded-lg bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer font-medium">
                                            {faq.question}
                                            <span className="transition group-open:rotate-180">
                                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                            </span>
                                        </summary>
                                        <div className="p-4 bg-gray-50 border-t text-gray-600">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                                {faqs.length === 0 && (
                                    <p className="text-gray-500 italic">Belum ada FAQ.</p>
                                )}
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="bg-teal-50 p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-100 rounded-full opacity-50 pointer-events-none" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">{contactInfo.title || 'Hubungi Kami'}</h2>
                            <p className="text-gray-600 mb-8 relative z-10">{contactInfo.description}</p>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm mr-4 flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">WhatsApp Khusus Wismen</p>
                                        <a href={`https://wa.me/${contactInfo.whatsapp?.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-teal-700 hover:underline">
                                            {contactInfo.whatsapp || '-'}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm mr-4 flex-shrink-0">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email Kemitraan / Pasien</p>
                                        <a href={`mailto:${contactInfo.email}`} className="text-lg font-bold text-teal-700 hover:underline break-all">
                                            {contactInfo.email || '-'}
                                        </a>
                                    </div>
                                </div>

                                {contactInfo.registrationLink && (
                                    <div className="pt-6 mt-6 border-t border-teal-200">
                                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="lg" onClick={() => window.open(contactInfo.registrationLink, '_blank')}>
                                            Formulir Pendaftaran Pasien
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default MedicalTourismPage;
