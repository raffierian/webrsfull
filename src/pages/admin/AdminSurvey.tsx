import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  TrendingUp,
  Users,
  Calendar,
  Download,
  ThumbsUp,
  ThumbsDown,
  Minus,
  QrCode
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminSurvey = () => {
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState("month");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const surveyUrl = `${window.location.origin}/survey`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(surveyUrl)}`;

  // Fetch Real Data from Backend
  const { data: stats, isLoading } = useQuery({
    queryKey: ['survey-stats', periodFilter],
    queryFn: () => api.surveys.getStats(periodFilter),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading Survey Data...</div>;
  }

  // Fallback if data is empty (initial state)
  const defaultStats = {
    averageScore: 0,
    totalResponses: 0,
    recommendationData: [],
    monthlyTrend: [],
    categoryScores: [],
    departmentScores: [],
    recentResponses: []
  };

  const data = stats || defaultStats;

  const renderStars = (score: number) => {
    const numScore = Number(score);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= numScore ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{numScore.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Survei Kepuasan (SKM)</h1>
          <p className="text-muted-foreground">Analisis kepuasan pelanggan rumah sakit (Data Real-time)</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="quarter">Kuartal Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsQrOpen(true)}>
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Export", description: "Fitur export akan segera hadir" })}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Survei Kepuasan</DialogTitle>
            <DialogDescription>
              Scan QR Code ini untuk langsung membuka halaman survei.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <img src={qrCodeUrl} alt="QR Code Survey" className="w-64 h-64" />
            </div>
            <p className="text-sm text-center text-muted-foreground break-all">
              Link: <a href={surveyUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{surveyUrl}</a>
            </p>
            <Button className="w-full" onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeUrl;
              link.download = 'survey-qr.png';
              link.target = '_blank';
              link.click();
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download / Buka Gambar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skor Rata-rata</p>
                <p className="text-4xl font-bold mt-1">{data.averageScore}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  Realtime
                </div>
              </div>
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary fill-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Responden</p>
            <p className="text-3xl font-bold mt-1">{data.totalResponses}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Periode ini
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Merekomendasikan (Ya)</p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {data.recommendationData.find((d: any) => d.name === 'Ya')?.value || 0}%
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              Net Promoter Score
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Respons Terbaru</p>
            <p className="text-3xl font-bold mt-1">{data.recentResponses?.length || 0}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Item
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Kepuasan</CardTitle>
            <CardDescription>Skor rata-rata dan jumlah responden</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" domain={[0, 5]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="score" name="Skor" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="responses" name="Responden" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendation Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Rekomendasi</CardTitle>
            <CardDescription>Apakah akan merekomendasikan RS?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.recommendationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {data.recommendationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Skor per Kategori</CardTitle>
          <CardDescription>Breakdown penilaian berdasarkan aspek</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryScores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Skor per Departemen</CardTitle>
          <CardDescription>Perbandingan kepuasan antar unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.departmentScores.map((dept: any) => (
              <div key={dept.department} className="p-4 border rounded-lg">
                <h4 className="font-medium">{dept.department}</h4>
                <div className="mt-2">{renderStars(dept.score)}</div>
                <p className="text-sm text-muted-foreground mt-2">{dept.responses} responden</p>
              </div>
            ))}
            {data.departmentScores.length === 0 && (
              <p className="text-muted-foreground text-sm col-span-4 text-center">Belum ada data departemen</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Respons Terbaru</CardTitle>
          <CardDescription>Feedback terbaru dari responden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentResponses?.map((response: any) => (
              <div key={response.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{response.respondentName || 'Anonim'}</span>
                      <span className="text-sm text-muted-foreground">• {response.department || 'Umum'}</span>
                      <span className="text-sm text-muted-foreground">• {new Date(response.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                    {renderStars(Number(response.ratings?.overall || 0))}
                    <p className="text-sm text-muted-foreground mt-2">"{response.comments || '-'}"</p>
                  </div>
                  <div className={`p-2 rounded-full ${response.recommendation === "YES" ? "bg-green-100" :
                    response.recommendation === "MAYBE" ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                    {response.recommendation === "YES" ? <ThumbsUp className="w-4 h-4 text-green-600" /> :
                      response.recommendation === "MAYBE" ? <Minus className="w-4 h-4 text-yellow-600" /> :
                        <ThumbsDown className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
              </div>
            ))}
            {data.recentResponses?.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">Belum ada survei masuk</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSurvey;
