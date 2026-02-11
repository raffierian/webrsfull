import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Phone,
  Search,
  ChevronDown,
  Globe,
  Heart,
  Stethoscope,
  Building2,
  AlertCircle,
  Activity,
  FlaskConical,
  User,
  Calendar,
  MessageCircle,
  Shield,
  Award,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchModal } from '@/components/SearchModal';

import { useSettings } from '@/hooks/useSettings';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  // Keyboard shortcut for search (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    {
      key: 'home',
      path: '/',
      label: t('nav.home')
    },
    {
      key: 'profile',
      path: '/profile',
      label: t('nav.profile'),
      dropdown: [
        { path: '/profile/history', label: t('nav.history'), icon: Building2 },
        { path: '/profile/vision-mission', label: 'Visi & Misi', icon: Heart },
      ]
    },
    {
      key: 'services',
      path: '/services',
      label: t('nav.services'),
      dropdown: [
        { path: '/services/rawat-jalan', label: t('nav.outpatient'), icon: Stethoscope },
        { path: '/services/rawat-inap', label: t('nav.inpatient'), icon: Building2 },
        { path: '/services/gawat-darurat', label: t('nav.emergency'), icon: AlertCircle },
        { path: '/services/perawatan-intensif', label: t('nav.intensive'), icon: Activity },
        { path: '/services/penunjang-medis', label: t('nav.supporting'), icon: FlaskConical },
      ]
    },
    {
      key: 'articles',
      path: '/articles',
      label: t('nav.articles'),
      dropdown: [
        { path: '/articles?category=Kesehatan', label: t('nav.health'), icon: Heart },
        { path: '/articles?category=Prestasi', label: t('nav.achievements'), icon: Award },
        { path: '/training', label: 'Diklat & Pelatihan', icon: GraduationCap },
      ]
    },
    {
      key: 'tools',
      path: '/tools-kesehatan',
      label: 'Tools Kesehatan',
    },
    {
      key: 'information',
      path: '/information',
      label: t('nav.information'),
      dropdown: [
        { path: '/information/standards', label: t('nav.serviceStandards'), icon: Heart },
        { path: '/information/tariffs', label: t('nav.tariffs'), icon: Heart },
        { path: '/rawat-inap', label: 'Rawat Inap', icon: Building2 },
        { path: '/information/innovation', label: t('nav.innovation'), icon: Heart },
        { path: '/information/sakip', label: t('nav.sakipDocuments'), icon: Heart },
        { path: '/zona-integritas', label: 'Zona Integritas (WBK/WBBM)', icon: Shield },
        { path: '/ppid', label: t('nav.ppid'), icon: Heart },
        { path: '/pkrs', label: 'Promosi Kesehatan', icon: Heart },
      ]
    },
    {
      key: 'contact',
      path: '/contact',
      label: t('nav.contact')
    },
  ];

  return (
    <>
      {/* Emergency Top Bar */}
      <div className="emergency-banner py-2 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 animate-pulse" />
            <span className="font-semibold">{t('common.emergency')}</span>
            <span>|</span>
            <span>{t('common.emergencyCall')}</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'id' ? 'EN' : 'ID'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-card/95 backdrop-blur-md shadow-lg"
            : "bg-card"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name || "Logo"}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="flex flex-col whitespace-nowrap">
                <h1 className="text-sm md:text-lg font-bold text-foreground leading-tight">{settings?.name || "RS Soewandhie"}</h1>
                <p className="hidden md:block text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">{settings?.tagline || "Melayani dengan Sepenuh Hati"}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center lg:gap-1 xl:gap-3">
              {navItems.map((item) => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "nav-link flex items-center gap-1 whitespace-nowrap",
                      location.pathname === item.path && "nav-link-active"
                    )}
                  >
                    {item.label}
                    {item.dropdown && <ChevronDown className="w-3 h-3" />}
                  </Link>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
                      >
                        {item.dropdown.map((subItem, idx) => {
                          const Icon = subItem.icon;
                          return (
                            <Link
                              key={idx}
                              to={subItem.path}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Highlighted Diklat Menu */}
              <Link
                to="/training"
                className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Diklat</span>
              </Link>

            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2 ml-2 lg:pl-2 xl:pl-4 lg:border-l border-border">
                {(settings?.external_links?.enablePatientPortal ?? true) && (
                  <Link to="/patient/login">
                    <Button variant="outline" size="sm" className="gap-2 h-10 px-3 xl:px-4 rounded-xl font-bold text-[10px] xl:text-xs uppercase tracking-wider">
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Portal Pasien</span>
                      <span className="xl:hidden">Portal</span>
                    </Button>
                  </Link>
                )}
                <Link to="/appointment">
                  <Button variant="medical" size="sm" className="gap-2 h-10 px-4 xl:px-5 rounded-xl font-bold text-[10px] xl:text-xs uppercase tracking-wider bg-primary hover:bg-primary-dark shadow-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">{t('common.bookAppointment')}</span>
                    <span className="xl:hidden">Janji Temu</span>
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>



        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-gradient-to-b from-card to-background shadow-inner"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <div key={item.key}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {item.label}
                      </Link>
                      {item.dropdown && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.dropdown.map((subItem, idx) => (
                            <Link
                              key={idx}
                              to={subItem.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {(settings?.external_links?.enablePatientPortal ?? true) && (
                    <Link to="/patient-portal" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Portal Pasien
                      </Button>
                    </Link>
                  )}
                  <Link to="/appointment" className="block">
                    <Button variant="medical" className="w-full gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('common.bookAppointment')}
                    </Button>
                  </Link>
                </div>

                {/* Language Toggle Mobile */}
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{i18n.language === 'id' ? 'English' : 'Bahasa Indonesia'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
