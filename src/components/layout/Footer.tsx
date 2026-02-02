import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight
} from 'lucide-react';

import { useSettings } from '@/hooks/useSettings';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hidden admin access - click logo 5 times quickly
  const handleLogoClick = () => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      navigate('/admin/login');
      setClickCount(0);
      return;
    }

    // Reset count after 3 seconds of no clicks
    timeoutRef.current = setTimeout(() => setClickCount(0), 3000);
  };

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/profile', label: t('nav.profile') },
    { path: '/services', label: t('nav.services') },
    { path: '/articles', label: t('nav.articles') },
    { path: '/contact', label: t('nav.contact') },
    { path: '/careers', label: t('nav.careers') },
  ];

  const serviceLinks = [
    { path: '/services/outpatient', label: t('nav.outpatient') },
    { path: '/services/inpatient', label: t('nav.inpatient') },
    { path: '/services/emergency', label: t('nav.emergency') },
    { path: '/services/intensive', label: t('nav.intensive') },
    { path: '/services/supporting', label: t('nav.supporting') },
  ];

  const infoLinks = [
    { path: '/information/tariffs', label: t('nav.tariffs') },
    { path: '/ppid', label: t('nav.ppid') },
    { path: '/complaint', label: t('nav.complaints') },
    { path: '/survey', label: 'Survei Kepuasan (SKM)' },
    { path: '/information/standards', label: 'Standar Pelayanan' },
  ];

  return (
    <footer className="footer-gradient text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-3 mb-6 cursor-pointer select-none"
            >
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name || "Logo"}
                  className="w-14 h-14 object-contain"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-secondary flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{settings?.name || "RS Soewandhie"}</h2>
                <p className="text-sm text-white/60">{settings?.tagline || "Melayani dengan Sepenuh Hati"}</p>
              </div>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              {settings?.description || "Rumah Sakit Umum Daerah milik Pemerintah Kota Surabaya"}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-light mt-0.5" />
                <span className="text-white/70 text-sm">
                  {settings?.address || "Jl. Tambak Rejo No.45-47, Simokerto, Surabaya"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-light" />
                <span className="text-white/70 text-sm">{settings?.phone || "(031) 3717141"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-light" />
                <span className="text-white/70 text-sm">{settings?.email || "info@rs-soewandhie.com"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary-light" />
                <span className="text-white/70 text-sm">{settings?.operatingHours || "24 Jam (IGD)"}</span>
              </div>

              {/* Emergency Numbers */}
              <div className="pt-2 mt-2 border-t border-white/10">
                <div className="flex items-start gap-3 mb-1">
                  <Phone className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-white/90 text-sm font-semibold">Gawat Darurat 24 Jam:</span>
                    <span className="text-white/70 text-sm">IGD RS: {settings?.emergencyPhone || "(031) 372XXXX"}</span>
                    <span className="text-white/70 text-sm">Command Center: 112</span>
                  </div>
                </div>
              </div>
            </div>

            {/* External Links Widget */}
            {(settings?.external_links?.zonaIntegritas || settings?.external_links?.wbs || settings?.external_links?.lapor) && (
              <div className="flex flex-wrap gap-2">
                {settings.external_links.zonaIntegritas && (
                  <a href={settings.external_links.zonaIntegritas} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white border border-white/20 transition-colors">
                    Zona Integritas
                  </a>
                )}
                {settings.external_links.wbs && (
                  <a href={settings.external_links.wbs} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white border border-white/20 transition-colors">
                    Whistleblower
                  </a>
                )}
                {settings.external_links.lapor && (
                  <a href={settings.external_links.lapor} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white border border-white/20 transition-colors">
                    Lapor Warga
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.information')}</h3>
            <ul className="space-y-2">
              {infoLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">{t('footer.followUs')}:</span>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            <p className="text-sm text-white/60">
              © {currentYear} {settings?.name || "RS Soewandhie"}. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
