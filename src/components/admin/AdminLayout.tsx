import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  DollarSign,
  Bell,
  User,
  MessageSquare,
  FolderOpen,
  GraduationCap,
  Star,
  Briefcase,
  Globe,
  Megaphone,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/content", label: "Konten", icon: Globe },
  { path: "/admin/appointments", label: "Janji Temu", icon: Calendar },
  { path: "/admin/articles", label: "Artikel", icon: FileText },
  { path: "/admin/services", label: "Layanan", icon: Building2 },
  { path: "/admin/doctors", label: "Dokter", icon: Users },
  { path: "/admin/tariffs", label: "Tarif", icon: DollarSign },
  { path: "/admin/inpatient-rooms", label: "Rawat Inap", icon: Building2 },
  { path: "/admin/complaints", label: "Pengaduan", icon: MessageSquare },
  { path: "/admin/ppid", label: "PPID", icon: FolderOpen },
  { path: "/admin/training", label: "Diklat", icon: GraduationCap },
  { path: "/admin/pkrs", label: "PKRS", icon: Megaphone },
  { path: "/admin/survey", label: "Survei SKM", icon: Star },
  { path: "/admin/careers", label: "Karir", icon: Briefcase },
  { path: "/admin/users", label: "Pengguna", icon: Users },
  { path: "/admin/roles", label: "Manajemen Role", icon: Shield },
  { path: "/admin/role-menus", label: "Akses Menu", icon: Shield },
  { path: "/admin/settings", label: "Pengaturan", icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  // Fetch Stats for Badges
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.dashboard.stats,
    refetchInterval: 30000, // Refresh every 30s
  });

  const totalBadges = (stats?.scheduledAppointments || 0) + (stats?.activeComplaints || 0);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");

    if (!token || !userData) {
      navigate("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch allowed menus for current user
  const { data: allowedMenus } = useQuery({
    queryKey: ['my-menus'],
    queryFn: api.roleMenus.getMy,
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (!user) return null;

  // Filter menu items based on allowed menus
  // If allowedMenus is undefined (loading) or empty, show nothing or default
  // If allowedMenus contains '*', show all
  const filteredMenuItems = menuItems.filter(item => {
    if (!allowedMenus) return false; // Loading state
    const menus = allowedMenus as string[];
    if (menus.includes('*')) return true; // Super Admin
    return menus.includes(item.path);
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-sm">{settings?.name || "RS Soewandhie"}</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.path === "/admin/appointments" && stats?.scheduledAppointments > 0 && (
                        <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">
                          {stats.scheduledAppointments}
                        </span>
                      )}
                      {item.path === "/admin/complaints" && stats?.activeComplaints > 0 && (
                        <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">
                          {stats.activeComplaints}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Toggle (Desktop) */}
        <div className="p-3 border-t hidden lg:block mt-auto">
          <Button
            variant="ghost"
            className={cn("w-full", isSidebarOpen ? "justify-start" : "justify-center px-2")}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              isSidebarOpen ? "rotate-90" : "-rotate-90"
            )} />
            {isSidebarOpen && <span className="ml-3">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-card border-b sticky top-0 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold hidden sm:block">
              {menuItems.find(item => item.path === location.pathname)?.label || "Admin"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/admin/appointments')}>
              <Bell className="w-5 h-5" />
              {totalBadges > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-destructive text-[10px] text-white rounded-full">
                  {totalBadges}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open('/', '_blank')}>
                  <Globe className="w-4 h-4 mr-2" />
                  Lihat Website
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
          <footer className="py-6 text-center text-[10px] text-muted-foreground/60">
            <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
            <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
