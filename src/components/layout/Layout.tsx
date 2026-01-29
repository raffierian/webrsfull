import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppWidget from '@/components/common/WhatsAppWidget';
import ChatWidget from '@/components/common/ChatWidget';

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
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {settings.external_links?.enableWhatsapp !== false && <WhatsAppWidget />}
      {settings.external_links?.enableChatbot !== false && <ChatWidget />}
    </div>
  );
};

export default Layout;
