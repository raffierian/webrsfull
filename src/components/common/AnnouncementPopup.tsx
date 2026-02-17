import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Megaphone } from "lucide-react";

interface AnnouncementPopupProps {
    enabled: boolean;
    title: string;
    content: string;
    image?: string;
    ctaText?: string;
    ctaLink?: string;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({
    enabled,
    title,
    content,
    image,
    ctaText,
    ctaLink
}) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (enabled && title) {
            const hasSeenPopup = sessionStorage.getItem('has_seen_announcement_popup');
            if (!hasSeenPopup) {
                // Delay slightly for better effect
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [enabled, title]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('has_seen_announcement_popup', 'true');
    };

    if (!enabled || !title) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-tr-full -z-10" />

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors z-20"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {image && (
                        <div className="h-56 w-full overflow-hidden">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8 md:p-10">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Pengumuman Terkini</span>
                            </div>
                            <DialogTitle className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-lg leading-relaxed pt-2 whitespace-pre-wrap">
                                {content}
                            </DialogDescription>
                        </DialogHeader>

                        {(ctaText && ctaLink) && (
                            <div className="mt-8">
                                <Button
                                    onClick={() => {
                                        window.open(ctaLink, ctaLink.startsWith('http') ? '_blank' : '_self');
                                        handleClose();
                                    }}
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-primary transition-all duration-300 shadow-xl shadow-slate-900/10 gap-2"
                                >
                                    {ctaText}
                                    <ExternalLink className="w-5 h-5" />
                                </Button>
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Tutup dan lanjut ke website
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default AnnouncementPopup;
