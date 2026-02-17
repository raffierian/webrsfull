import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnnouncementBarProps {
    text: string;
    type?: 'info' | 'alert';
    link?: string;
    onClose?: () => void;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
    text,
    type = 'info',
    link,
    onClose
}) => {
    if (!text) return null;

    const bgStyles = type === 'alert'
        ? 'bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground'
        : 'bg-gradient-to-r from-primary-dark via-primary to-primary-light text-primary-foreground';

    const Icon = type === 'alert' ? AlertTriangle : Megaphone;

    const content = (
        <div className="flex items-center justify-center gap-3 py-2 px-4 text-sm font-medium">
            <Icon className="w-4 h-4 shrink-0 animate-pulse" />
            <p className="truncate max-w-[80vw]">
                {text}
            </p>
            {link && (
                <div className="hidden sm:flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity">
                    <span className="underline underline-offset-4 decoration-current/30">Selengkapnya</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            )}
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`relative z-[100] w-full overflow-hidden shadow-sm ${bgStyles}`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex-1">
                        {link ? (
                            <a
                                href={link}
                                target={link.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="block hover:opacity-90 transition-opacity"
                            >
                                {content}
                            </a>
                        ) : content}
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors mr-2"
                            aria-label="Tutup pengumuman"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementBar;
