import {
    LayoutDashboard,
    Globe,
    Calendar,
    CreditCard,
    FileText,
    Brain,
    Building2,
    Users,
    UserCog,
    DollarSign,
    MessageSquare,
    FolderOpen,
    GraduationCap,
    Megaphone,
    Star,
    Briefcase,
    Shield,
    Settings,
    Plane
} from "lucide-react";

export interface AdminMenuItem {
    path: string;
    label: string;
    icon: any;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/content", label: "Konten", icon: Globe },
    { path: "/admin/appointments", label: "Janji Temu", icon: Calendar },
    { path: "/admin/payments", label: "Pembayaran", icon: CreditCard },
    { path: "/admin/articles", label: "Artikel", icon: FileText },
    { path: "/admin/knowledge", label: "Pengetahuan AI", icon: Brain },
    { path: "/admin/services", label: "Layanan", icon: Building2 },
    { path: "/admin/doctors", label: "Dokter", icon: Users },
    { path: "/admin/doctor-accounts", label: "Akun Dokter", icon: UserCog },
    { path: "/admin/tariffs", label: "Tarif", icon: DollarSign },
    { path: "/admin/inpatient-rooms", label: "Rawat Inap", icon: Building2 },
    { path: "/admin/complaints", label: "Pengaduan", icon: MessageSquare },
    { path: "/admin/ppid", label: "PPID", icon: FolderOpen },
    { path: "/admin/training", label: "Diklat", icon: GraduationCap },
    { path: "/admin/pkrs", label: "PKRS", icon: Megaphone },
    { path: "/admin/survey", label: "Survei SKM", icon: Star },
    { path: "/admin/careers", label: "Karir", icon: Briefcase },
    { path: "/admin/medical-tourism", label: "Wisata Medis", icon: Plane },
    { path: "/admin/users", label: "Pengguna", icon: Users },
    { path: "/admin/roles", label: "Manajemen Role", icon: Shield },
    { path: "/admin/role-menus", label: "Akses Menu", icon: Shield },
    { path: "/admin/payment-settings", label: "Pengaturan Pembayaran", icon: DollarSign },
    { path: "/admin/settings", label: "Pengaturan", icon: Settings },
];
