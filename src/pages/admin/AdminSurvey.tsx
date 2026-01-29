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
  Minus
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

interface SurveyResponse {
  id: number;
  respondentName: string;
  visitDate: string;
  department: string;
  ratings: {
    facilities: number;
    service: number;
    cleanliness: number;
    waitTime: number;
    overall: number;
  };
  feedback: string;
  recommendation: "yes" | "maybe" | "no";
  createdAt: string;
}

const surveyData: SurveyResponse[] = [
  {
    id: 1,
    respondentName: "Ahmad S.",
    visitDate: "2024-01-15",
    department: "Rawat Jalan",
    ratings: { facilities: 4, service: 5, cleanliness: 5, waitTime: 3, overall: 4 },
    feedback: "Pelayanan sangat baik, namun waktu tunggu agak lama",
    recommendation: "yes",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    respondentName: "Siti R.",
    visitDate: "2024-01-14",
    department: "IGD",
    ratings: { facilities: 5, service: 5, cleanliness: 5, waitTime: 5, overall: 5 },
    feedback: "Penanganan cepat dan profesional",
    recommendation: "yes",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    respondentName: "Budi H.",
    visitDate: "2024-01-13",
    department: "Rawat Inap",
    ratings: { facilities: 4, service: 4, cleanliness: 4, waitTime: 4, overall: 4 },
    feedback: "Cukup puas dengan pelayanan",
    recommendation: "maybe",
    createdAt: "2024-01-13",
  },
];

const monthlyTrend = [
  { month: "Aug", score: 4.1, responses: 120 },
  { month: "Sep", score: 4.2, responses: 145 },
  { month: "Oct", score: 4.0, responses: 132 },
  { month: "Nov", score: 4.3, responses: 158 },
  { month: "Dec", score: 4.4, responses: 175 },
  { month: "Jan", score: 4.5, responses: 189 },
];

const categoryScores = [
  { name: "Fasilitas", score: 4.3 },
  { name: "Pelayanan", score: 4.6 },
  { name: "Kebersihan", score: 4.5 },
  { name: "Waktu Tunggu", score: 3.8 },
  { name: "Keseluruhan", score: 4.4 },
];

const recommendationData = [
  { name: "Ya", value: 75, color: "#22c55e" },
  { name: "Mungkin", value: 18, color: "#eab308" },
  { name: "Tidak", value: 7, color: "#ef4444" },
];

const departmentScores = [
  { department: "Rawat Jalan", score: 4.5, responses: 89 },
  { department: "Rawat Inap", score: 4.3, responses: 45 },
  { department: "IGD", score: 4.6, responses: 32 },
  { department: "Laboratorium", score: 4.2, responses: 23 },
];

const AdminSurvey = () => {
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState("month");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const averageScore = (categoryScores.reduce((sum, c) => sum + c.score, 0) / categoryScores.length).toFixed(2);
  const totalResponses = monthlyTrend.reduce((sum, m) => sum + m.responses, 0);

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Survei Kepuasan (SKM)</h1>
          <p className="text-muted-foreground">Analisis kepuasan pelanggan rumah sakit</p>
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
          <Button variant="outline" onClick={() => toast({ title: "Export", description: "Laporan diekspor" })}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skor Rata-rata</p>
                <p className="text-4xl font-bold mt-1">{averageScore}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +0.3 dari bulan lalu
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
            <p className="text-3xl font-bold mt-1">{totalResponses}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              6 bulan terakhir
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Merekomendasikan</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{recommendationData[0].value}%</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              Net Promoter Score
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Respons Bulan Ini</p>
            <p className="text-3xl font-bold mt-1">{monthlyTrend[monthlyTrend.length - 1].responses}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Januari 2024
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Kepuasan 6 Bulan Terakhir</CardTitle>
            <CardDescription>Skor rata-rata dan jumlah responden</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" domain={[3.5, 5]} />
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
                  data={recommendationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {recommendationData.map((entry, index) => (
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
            <BarChart data={categoryScores} layout="vertical">
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
            {departmentScores.map((dept) => (
              <div key={dept.department} className="p-4 border rounded-lg">
                <h4 className="font-medium">{dept.department}</h4>
                <div className="mt-2">{renderStars(dept.score)}</div>
                <p className="text-sm text-muted-foreground mt-2">{dept.responses} responden</p>
              </div>
            ))}
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
            {surveyData.map((response) => (
              <div key={response.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{response.respondentName}</span>
                      <span className="text-sm text-muted-foreground">• {response.department}</span>
                      <span className="text-sm text-muted-foreground">• {new Date(response.visitDate).toLocaleDateString("id-ID")}</span>
                    </div>
                    {renderStars(response.ratings.overall)}
                    <p className="text-sm text-muted-foreground mt-2">"{response.feedback}"</p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    response.recommendation === "yes" ? "bg-green-100" : 
                    response.recommendation === "maybe" ? "bg-yellow-100" : "bg-red-100"
                  }`}>
                    {response.recommendation === "yes" ? <ThumbsUp className="w-4 h-4 text-green-600" /> :
                     response.recommendation === "maybe" ? <Minus className="w-4 h-4 text-yellow-600" /> :
                     <ThumbsDown className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSurvey;
