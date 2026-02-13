import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, EyeOff, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState<"EMAIL" | "TOTP">("EMAIL");
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setTwoFactorType(data.data.twoFactorType);
          setUserId(data.data.userId);
          setMaskedEmail(data.data.email || "");
          toast({
            title: "Verifikasi Diperlukan",
            description: data.data.twoFactorType === "TOTP"
              ? "Masukkan kode dari Google Authenticator Anda."
              : "Kode OTP telah dikirim ke email Anda.",
          });
          return;
        }

        handleLoginSuccess(data.data);
      } else {
        toast({
          title: "Login Gagal",
          description: data.message || "Username atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Tidak dapat terhubung ke server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code: otpCode, type: twoFactorType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        handleLoginSuccess(data.data);
      } else {
        toast({
          title: "Verifikasi Gagal",
          description: data.message || "Kode OTP tidak valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memverifikasi kode.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast({
          title: "Kode Dikirim",
          description: "Kode OTP baru telah dikirim ke email Anda.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim ulang kode.",
        variant: "destructive",
      });
    }
  };

  const handleLoginSuccess = (data: any) => {
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      name: data.user.name,
      role: data.user.role.toLowerCase(),
    }));

    toast({
      title: "Login Berhasil",
      description: `Selamat datang, ${data.user.name}`,
    });
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          {/* ... existing card content ... */}
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 border shadow-sm">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
              <CardDescription>{settings?.name || "RS Soewandhie Surabaya"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!twoFactorRequired ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username atau Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username atau email"
                      className="pl-10"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="pl-10 pr-10"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Lupa Password?
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2 text-center">
                  <Label className="text-base">Verifikasi Dua Faktor</Label>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorType === "TOTP" ? (
                      "Buka aplikasi Google Authenticator Anda dan masukkan 6 digit kode yang muncul."
                    ) : (
                      <>
                        Masukkan 6 digit kode yang dikirim ke <br />
                        <span className="font-medium text-foreground">{maskedEmail}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    className="text-center text-2xl tracking-[1rem] font-bold h-16"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? "Memverifikasi..." : "Verifikasi"}
                </Button>

                <div className="text-center">
                  {twoFactorType === "EMAIL" && (
                    <p className="text-sm text-muted-foreground">
                      Tidak menerima kode?{" "}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-primary hover:underline font-medium"
                      >
                        Kirim Ulang
                      </button>
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="mt-4 text-muted-foreground"
                    onClick={() => setTwoFactorRequired(false)}
                  >
                    Ganti Akun
                  </Button>
                </div>
              </form>
            )}

            {/* Demo credentials hidden - only shown in development */}
            {import.meta.env.DEV && !twoFactorRequired && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Demo Login:</strong><br />
                  Email: admin@rssoewandhie.com<br />
                  Password: admin123
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate('/')} className="text-muted-foreground">
                &larr; Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-[10px] text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} RH Production. All Rights Reserved.</p>
          <p className="mt-0.5">Unauthorized reproduction or distribution of this software is strictly prohibited.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLogin;
