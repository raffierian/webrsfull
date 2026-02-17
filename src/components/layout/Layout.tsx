import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppWidget from '@/components/common/WhatsAppWidget';
import ChatWidget from '@/components/common/ChatWidget';
import AnnouncementBar from './AnnouncementBar';
import AnnouncementPopup from '@/components/common/AnnouncementPopup';

import { useSettings } from '@/hooks/useSettings';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Hidden admin access via keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {settings.announcement_bar?.enabled && (
        <AnnouncementBar
          text={settings.announcement_bar.text}
          type={settings.announcement_bar.type}
          link={settings.announcement_bar.link}
        />
      )}
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {settings.announcement_popup?.enabled && (
        <AnnouncementPopup
          enabled={settings.announcement_popup.enabled}
          title={settings.announcement_popup.title}
          content={settings.announcement_popup.content}
          image={settings.announcement_popup.image}
          ctaText={settings.announcement_popup.cta_text}
          ctaLink={settings.announcement_popup.cta_link}
        />
      )}
      {settings.external_links?.enableWhatsapp !== false && <WhatsAppWidget />}
      {settings.external_links?.enableChatbot !== false && <ChatWidget />}
    </div>
  );
};

export default Layout;
