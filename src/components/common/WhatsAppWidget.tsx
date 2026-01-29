import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const WhatsAppWidget: React.FC = () => {
  const { settings } = useSettings();
  const whatsappNumber = settings?.whatsapp || '6281234567890';
  const hospitalName = settings?.name || 'RS Harapan Sehat';
  const message = encodeURIComponent(`Halo, saya ingin bertanya tentang layanan ${hospitalName}.`);

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-semibold hidden sm:block">Chat WhatsApp</span>
    </motion.a>
  );
};

export default WhatsAppWidget;
