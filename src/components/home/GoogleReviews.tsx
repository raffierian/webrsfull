import React, { useEffect, useRef } from 'react';
import { Star, User, Quote, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoogleReviewsProps {
    placeId?: string;
    className?: string;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ placeId, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect script tags (Trustindex style)
    const isScript = placeId?.includes('<script');
    const isEmbed = placeId?.startsWith('http') && !isScript;

    // Extract SRC if it's a script tag
    let scriptSrc = "";
    if (isScript && placeId) {
        const match = placeId.match(/src=['"]([^'"]+)['"]/);
        if (match) scriptSrc = match[1];
    }

    // Effect to inject script
    useEffect(() => {
        if (!isScript || !scriptSrc) return;

        // Trustindex and similar widgets often need to be re-run on route changes
        // If script exists, we might need to trigger its init function if available, 
        // but removing and re-adding is often safer for these simple loaders.

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.defer = true;

        // Some widgets look for the script's parent to inject the widget
        if (containerRef.current) {
            containerRef.current.appendChild(script);
        } else {
            document.body.appendChild(script);
        }

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            // Cleanup added elements
            const tiElements = document.querySelectorAll('.ti-widget, .ti-pa-container, iframe[id^="ti-"]');
            tiElements.forEach(el => el.remove());
        };
    }, [isScript, scriptSrc]);

    // Construct the Google Maps review link
    const mapsLink = placeId && !isEmbed && !isScript
        ? `https://www.google.com/maps/search/?api=1&query=RS+Soewandhie+Surabaya&query_place_id=${placeId}`
        : "https://www.google.com/maps/search/?api=1&query=RS+Soewandhie+Surabaya";

    if (isScript) {
        return (
            <section className={`py-12 bg-white ${className}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                            <span className="text-sm font-medium text-gray-500">Google Reviews</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Ulasan Pelanggan</h2>
                    </div>
                    {/* Dedicated container with ref for the script to attach to */}
                    <div ref={containerRef} className="flex justify-center min-h-[300px] w-full" id="trustindex-widget-container">
                        {/* The script will inject the widget here or nearby */}
                    </div>
                </div>
            </section>
        );
    }

    if (isEmbed && placeId) {
        return (
            <section className={`py-12 bg-white ${className}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                            <span className="text-sm font-medium text-gray-500">Google Reviews</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Ulasan Pelanggan</h2>
                    </div>
                    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                        <iframe
                            src={placeId}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Reviews Widget"
                        ></iframe>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={`py-16 bg-gradient-to-b from-white to-gray-50 ${className}`}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                        <span className="text-sm font-medium text-gray-500">Google Reviews</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Pasien Kami?</h2>
                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-current" />
                        ))}
                    </div>
                </div>

                <div className="max-w-xl mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Kami sangat menghargai setiap saran dan ulasan dari Anda untuk terus meningkatkan kualitas pelayanan kami.
                    </p>
                    <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all duration-300 gap-3 shadow-xl shadow-slate-900/10 hover:shadow-primary/30"
                    >
                        <span>Tulis atau Lihat Ulasan di Google</span>
                        <ChevronRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default GoogleReviews;
