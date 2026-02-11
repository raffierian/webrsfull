import React from 'react';
import { Star, User, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoogleReviewsProps {
    placeId?: string;
    className?: string;
}

const MOCK_REVIEWS = [
    {
        author_name: "Budi Santoso",
        rating: 5,
        relative_time_description: "1 minggu lalu",
        text: "Pelayanan sangat memuaskan, dokter dan perawat ramah. Fasilitas juga lengkap dan bersih. Terima kasih RS Soewandhie.",
        profile_photo_url: "https://lh3.googleusercontent.com/a-/ALV-UjWH..."
    },
    {
        author_name: "Siti Aminah",
        rating: 5,
        relative_time_description: "2 bulan lalu",
        text: "Antrian online sangat membantu, tidak perlu menunggu lama. Penanganan di IGD juga cepat dan tanggap.",
        profile_photo_url: null
    },
    {
        author_name: "Rahmat Hidayat",
        rating: 4,
        relative_time_description: "3 bulan lalu",
        text: "Rumah sakit yang bersih dan nyaman. Parkiran luas. Semoga terus ditingkatkan pelayanannya.",
        profile_photo_url: null
    },
    {
        author_name: "Dewi Lestari",
        rating: 5,
        relative_time_description: "1 bulan lalu",
        text: "Dokter spesialis anaknya sangat sabar dan teliti. Anak saya jadi tidak takut diperiksa.",
        profile_photo_url: null
    }
];

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ placeId, className }) => {
    // Logic to fetch real reviews would go here if we had an API key / Backend proxy
    // For now, we use mock reviews or if placeId is an Embed URL, use that.

    const isEmbed = placeId?.startsWith('http');

    if (isEmbed && placeId) {
        return (
            <section className={`py-12 bg-white ${className}`}>
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        Ulasan Google
                    </h2>
                    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
                        <iframe src={placeId} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={`py-16 bg-gradient-to-b from-white to-gray-50 ${className}`}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                        <span className="text-sm font-medium text-gray-500">Google Reviews</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Pasien Kami?</h2>
                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-current" />
                        ))}
                        <span className="text-gray-600 text-sm ml-2 font-medium">(4.8/5.0 dari 500+ Ulasan)</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_REVIEWS.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {review.profile_photo_url ? (
                                        <img src={review.profile_photo_url} alt={review.author_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{review.author_name}</h4>
                                    <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                                </div>
                            </div>

                            <div className="flex text-yellow-400 mb-3">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                            </div>

                            <div className="relative flex-grow">
                                <Quote className="w-6 h-6 text-gray-100 absolute -top-1 -left-1" />
                                <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                                    "{review.text}"
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=RS+Soewandhie+Surabaya"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary font-medium hover:underline"
                    >
                        Lihat Semua Ulasan di Google Maps
                    </a>
                </div>
            </div>
        </section>
    );
};

export default GoogleReviews;
