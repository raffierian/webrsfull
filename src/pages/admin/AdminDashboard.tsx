import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Calendar,
  BedDouble,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  UserCheck,
  Loader2,
  Edit
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUpdateStatsOpen, setIsUpdateStatsOpen] = useState(false);
  const [statsForm, setStatsForm] = useState({ bor: "", igdCount: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const userData = localStorage.getItem("adminUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(['ADMIN', 'SUPER_ADMIN'].includes(user.role));
      } catch (e) {
        console.error("Failed to parse admin user", e);
      }
    }
    return () => clearInterval(timer);
  }, []);

  // Fetch Dashboard Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.dashboard.stats,
    enabled: isAdmin,
  });

  // Fetch Visit Trends
  const { data: trendData, isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: api.dashboard.visitTrends,
    enabled: isAdmin,
  });

  // Fetch Poli Distribution
  const { data: poliData, isLoading: poliLoading } = useQuery({
    queryKey: ['admin-poli'],
    queryFn: api.dashboard.poliDistribution,
    enabled: isAdmin,
  });

  // Fetch Recent Appointments
  const { data: appointmentsValue, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments-recent'],
    queryFn: () => api.appointments.getAllAdmin('limit=5&status=PENDING'),
    enabled: isAdmin,
  });

  const recentAppointments = Array.isArray(appointmentsValue) ? appointmentsValue : [];

  // Prepare chart data from API response
  const chartData = trendData ? Object.entries(trendData).map(([month, count]) => ({
    month,
    visits: count
  })) : [];

  // Update Stats Mutation
  const updateStatsMutation = useMutation({
    mutationFn: api.dashboard.updateStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: "Berhasil", description: "Data harian berhasil diperbarui" });
      setIsUpdateStatsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message || "Gagal memperbarui data",
        variant: "destructive"
      });
    }
  });

  const handleUpdateStats = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatsMutation.mutate(statsForm);
  };

  // Pre-fill form when opening dialog
  useEffect(() => {
    if (isUpdateStatsOpen && stats) {
      setStatsForm({
        bor: stats.bedOccupancyRate?.toString() || "0",
        igdCount: stats.emergencyPatients?.toString() || "0"
      });
    }
  }, [isUpdateStatsOpen, stats]);

  const statsCards = [
    {
      title: "Total Kunjungan Hari Ini",
      value: statsLoading ? "..." : stats?.todayVisits || 0,
      change: "+12%", // Backend doesn't provide this yet, keep static or calc
      trend: "up",
      icon: Users,
      color: "bg-primary",
    },
    {
      title: "Janji Temu Terjadwal",
      value: statsLoading ? "..." : stats?.scheduledAppointments || 0,
      change: "+5%",
      trend: "up",
      icon: Calendar,
      color: "bg-secondary",
    },
    {
      title: "Bed Terisi (BOR)",
      value: statsLoading ? "..." : `${stats?.bedOccupancyRate || 0}%`,
      change: "-3%",
      trend: "down",
      icon: BedDouble,
      color: "bg-accent",
    },
    {
      title: "Pasien IGD",
      value: statsLoading ? "..." : stats?.emergencyPatients || 0,
      change: "+2",
      trend: "up",
      icon: Activity,
      color: "bg-destructive",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: "bg-green-100 text-green-800",
      WAITING: "bg-yellow-100 text-yellow-800",
      PENDING: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      CONFIRMED: "Dikonfirmasi",
      WAITING: "Menunggu",
      PENDING: "Pending",
      CANCELLED: "Dibatalkan",
      COMPLETED: "Selesai",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (statsLoading && trendsLoading && poliLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })} - {currentTime.toLocaleTimeString("id-ID")}
            </span>
          </div>

          <Dialog open={isUpdateStatsOpen} onOpenChange={setIsUpdateStatsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Update Data Harian
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Data Harian</DialogTitle>
                <DialogDescription>
                  Masukkan data statistik rumah sakit untuk hari ini ({new Date().toLocaleDateString('id-ID')}).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateStats} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bor">Bed Occupancy Rate (BOR) %</Label>
                  <Input
                    id="bor"
                    type="number"
                    step="0.01"
                    placeholder="Contoh: 75.5"
                    value={statsForm.bor}
                    onChange={(e) => setStatsForm({ ...statsForm, bor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="igd">Jumlah Pasien IGD</Label>
                  <Input
                    id="igd"
                    type="number"
                    placeholder="Contoh: 15"
                    value={statsForm.igdCount}
                    onChange={(e) => setStatsForm({ ...statsForm, igdCount: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUpdateStatsOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={updateStatsMutation.isPending}>
                    {updateStatsMutation.isPending ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change} dari kemarin</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Kunjungan</CardTitle>
            <CardDescription>Data kunjungan per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="Total Kunjungan"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution by Poli */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kunjungan per Poli</CardTitle>
            <CardDescription>Berdasarkan janji temu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={poliData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(poliData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={[
                      "hsl(var(--primary))",
                      "hsl(var(--secondary))",
                      "hsl(var(--accent))",
                      "hsl(var(--destructive))",
                      "#8B5CF6"
                    ][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Janji Temu Terbaru</CardTitle>
              <CardDescription>Permintaan janji temu yang perlu konfirmasi</CardDescription>
            </div>
            <UserCheck className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pasien</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Layanan</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Dokter</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Waktu</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada janji temu terbaru
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((apt: any) => (
                    <tr key={apt.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{apt.patient?.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{apt.service?.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{apt.doctor?.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(apt.appointmentDate).toLocaleDateString()} {apt.appointmentTime}
                      </td>
                      <td className="py-3 px-2">{getStatusBadge(apt.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
