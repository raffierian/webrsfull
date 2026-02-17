/**
 * COPYRIGHT (c) 2025 Roni Hidayat (RH Production). All Rights Reserved.
 * This software is the proprietary property of Roni Hidayat (RH Production).
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { api } from "@/services/api";
import Index from "./pages/Index";
import AppointmentPage from "./pages/AppointmentPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ContactPage from "./pages/ContactPage";
import DoctorsPage from "./pages/DoctorsPage";
import ProfilePage from "./pages/ProfilePage";
import ComplaintPage from "./pages/ComplaintPage";
import CareersPage from "./pages/CareersPage";
import SurveyPage from "./pages/SurveyPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import ConsultationPage from "./pages/ConsultationPage";
import TrainingPage from "./pages/TrainingPage";
import TrainingDetailPage from "./pages/TrainingDetailPage";
import PPIDPage from "./pages/PPIDPage";
import ZonaIntegritasPage from "./pages/ZonaIntegritasPage";
import InformationPage from "./pages/InformationPage";
import InpatientInfoPage from "./pages/InpatientInfoPage";
import StructurePage from "./pages/profile/StructurePage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminContent from "./pages/admin/AdminContent";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminServices from "./pages/admin/AdminServices";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminDoctorAccounts from "./pages/admin/AdminDoctorAccounts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminPPID from "./pages/admin/AdminPPID";
import AdminTraining from "./pages/admin/AdminTraining";
import AdminSurvey from "./pages/admin/AdminSurvey";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminHealthPromo from "./pages/admin/AdminHealthPromo";
import AdminTariffs from "./pages/admin/AdminTariffs";
import AdminInpatientRooms from "./pages/admin/AdminInpatientRooms";
import AdminRoleMenus from "./pages/admin/AdminRoleMenus";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminKnowledge from "./pages/admin/AdminKnowledge";
import HealthPromoPage from "./pages/HealthPromoPage";
import HealthToolsPage from "./pages/HealthToolsPage";
import BMICalculatorPage from "./pages/tools/BMICalculatorPage";
import CalorieCalculatorPage from "./pages/tools/CalorieCalculatorPage";
import PregnancyCalculatorPage from "./pages/tools/PregnancyCalculatorPage";
import IdealWeightCalculatorPage from "./pages/tools/IdealWeightCalculatorPage";
import WaterIntakeCalculatorPage from "./pages/tools/WaterIntakeCalculatorPage";
import HeartRateCalculatorPage from "./pages/tools/HeartRateCalculatorPage";
import PatientLogin from "./pages/patient/auth/PatientLogin";
import PatientRegister from "./pages/patient/auth/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientNewAppointment from "./pages/patient/PatientNewAppointment";
import ConsultationChatPage from '@/pages/patient/ConsultationChatPage';
import PatientConsultationPage from '@/pages/patient/PatientConsultationPage';
import ConsultationPaymentPage from '@/pages/patient/ConsultationPaymentPage';
import PatientProfile from "./pages/patient/PatientProfile";
import PatientLayout from "./components/patient/PatientLayout";
import DoctorLayout from "./components/doctor/DoctorLayout";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorChatPage from "./pages/doctor/DoctorChatPage";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import "@/i18n";
import { useSettings } from "@/hooks/useSettings";

import { FaviconUpdater } from "@/components/common/FaviconUpdater";
import { Footer } from "@/components/common/Footer";
import ProtectedPatientRoute from "./components/patient/ProtectedPatientRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Track visitor once per session
    const hasTracked = sessionStorage.getItem("visitor_tracked");
    if (!hasTracked) {
      api.stats.trackVisitor()
        .then(() => sessionStorage.setItem("visitor_tracked", "true"))
        .catch(err => console.error("Stats tracking error:", err));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FaviconUpdater />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/appointment" element={<AppointmentPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:type" element={<ServiceDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/profile/doctors" element={<DoctorsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/structure" element={<StructurePage />} />
                <Route path="/profile/:section" element={<ProfilePage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                <Route path="/complaint" element={<ComplaintPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/survey" element={<SurveyPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                <Route path="/information" element={<InformationPage />} />
                <Route path="/information/:section" element={<InformationPage />} />
                <Route path="/patient-portal" element={<NotFound />} /> {/* Placeholder or real page if exists */}
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/training/:slug" element={<TrainingDetailPage />} />
                <Route path="/pkrs" element={<HealthPromoPage />} />
                <Route path="/ppid" element={<PPIDPage />} />
                <Route path="/zona-integritas" element={<ZonaIntegritasPage />} />
                <Route path="/rawat-inap" element={<InpatientInfoPage />} />
                <Route path="/tools-kesehatan" element={<HealthToolsPage />} />
                <Route path="/tools-kesehatan/bmi" element={<BMICalculatorPage />} />
                <Route path="/tools-kesehatan/kalori" element={<CalorieCalculatorPage />} />
                <Route path="/tools-kesehatan/kehamilan" element={<PregnancyCalculatorPage />} />
                <Route path="/tools-kesehatan/berat-ideal" element={<IdealWeightCalculatorPage />} />
                <Route path="/tools-kesehatan/kebutuhan-air" element={<WaterIntakeCalculatorPage />} />
                <Route path="/tools-kesehatan/denyut-jantung" element={<HeartRateCalculatorPage />} />

                {/* Patient Routes */}
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/register" element={<PatientRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/patient" element={<PatientLayout />}>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="appointments" element={<PatientAppointments />} />
                  <Route path="appointment/new" element={<ProtectedPatientRoute><PatientNewAppointment /></ProtectedPatientRoute>} />
                  <Route path="consultation" element={<ProtectedPatientRoute><PatientConsultationPage /></ProtectedPatientRoute>} />
                  <Route path="consultation/payment/:sessionId" element={<ConsultationPaymentPage />} />
                  <Route path="consultation/chat/:sessionId" element={<ProtectedPatientRoute><ConsultationChatPage /></ProtectedPatientRoute>} />
                  <Route path="profile" element={<PatientProfile />} />
                </Route>

                {/* Doctor Routes */}
                <Route path="/doctor/login" element={<DoctorLogin />} />
                <Route path="/doctor" element={<DoctorLayout />}>
                  <Route path="consultations" element={<DoctorConsultations />} />
                  <Route path="chat/:sessionId" element={<DoctorChatPage />} />
                  <Route path="profile" element={<DoctorProfile />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="payment-settings" element={<AdminPaymentSettings />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="doctors" element={<AdminDoctors />} />
                  <Route path="doctor-accounts" element={<AdminDoctorAccounts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="ppid" element={<AdminPPID />} />
                  <Route path="training" element={<AdminTraining />} />
                  <Route path="pkrs" element={<AdminHealthPromo />} />
                  <Route path="tariffs" element={<AdminTariffs />} />
                  <Route path="survey" element={<AdminSurvey />} />
                  <Route path="careers" element={<AdminCareers />} />
                  <Route path="inpatient-rooms" element={<AdminInpatientRooms />} />
                  <Route path="role-menus" element={<AdminRoleMenus />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="knowledge" element={<AdminKnowledge />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
