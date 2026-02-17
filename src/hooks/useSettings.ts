import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface HospitalSettings {
    name: string;
    tagline: string;
    email: string;
    admissionEmail?: string;
    careerEmail?: string;
    phone: string;
    whatsapp: string;
    address: string;
    website: string;
    description: string;
    emergencyPhone?: string;
    operatingHours?: string;
    mapUrl?: string;
    logoUrl?: string;
    faviconUrl?: string;
    consultationEnabled?: boolean;
    external_links?: {
        zonaIntegritas?: string;
        wbs?: string;
        lapor?: string;
        enableChatbot?: boolean;
        enableWhatsapp?: boolean;
        consultationEnabled?: boolean;
        enablePatientPortal?: boolean;
        googleReviews?: {
            enabled: boolean;
            placeId?: string;
        };
        chatbotMascot?: string;
    };
    org_structure?: {
        leaders: any[];
        divisions: any[];
    };
    profile_settings?: {
        vision?: string;
        mission?: string;
        moto?: string;
        maklumat?: string;
        about?: string;
        history?: string;
        values?: string;
        aboutImages?: string[];
        aboutFeatures?: string[];
        stats?: {
            patients: string;
            doctors: string;
            experience: string;
            satisfaction: string;
        };
    };
    service_standards?: {
        description?: string;
        maklumat?: string; // Overlap with profile_settings, but specific to standards page if needed
        promise?: string;
    };
    innovations?: Array<{
        title: string;
        description: string;
        icon?: string;
    }>;
    service_pages?: {
        outpatient?: ServicePageContent;
        inpatient?: ServicePageContent;
        emergency?: ServicePageContent;
        intensive?: ServicePageContent;
        supporting?: ServicePageContent;
        specialist?: ServicePageContent;
    };
    zi_settings?: {
        achievements?: Array<{
            year: number;
            title: string;
            description: string;
        }>;
        scores?: {
            spak: string;
            spkp: string;
            sakip: string;
        };
        status: {
            wbk_text: string;
            wbk_year: number;
            wbbm_target_text: string;
            wbbm_target_year: number;
        };
        programs: Array<{
            title: string;
            description: string;
            icon: string;
        }>;
        indikators: {
            wbk_process: string;
            wbk_result: string;
            wbbm_syarat: string;
        };
    };
    announcement_bar?: {
        enabled: boolean;
        text: string;
        type: 'info' | 'alert';
        link?: string;
    };
    announcement_popup?: {
        enabled: boolean;
        title: string;
        content: string;
        image?: string;
        cta_text?: string;
        cta_link?: string;
    };
}

export interface ServicePageContent {
    title?: string;
    description?: string;
    fullDescription?: string;
    image?: string;
    icon?: string;
    color?: string;
    features?: string[];
    procedures?: string[];
    facilities?: string[];
    doctors?: Array<{
        name: string;
        specialty: string;
        schedule: string;
    }>;
}



const DEFAULT_SERVICE_PAGES: Record<string, ServicePageContent> = {
    outpatient: {
        title: 'Rawat Jalan',
        description: 'Layanan konsultasi dan pemeriksaan kesehatan tanpa rawat inap',
        fullDescription: `Layanan rawat jalan RS Soewandhie menyediakan konsultasi dengan dokter spesialis dan pemeriksaan kesehatan lengkap. Dengan sistem antrian online dan pelayanan yang efisien, Anda dapat berkonsultasi dengan dokter pilihan tanpa harus menunggu lama.`,
        icon: 'Stethoscope',
        color: 'from-primary to-primary-light',
        image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=500&fit=crop',
        features: ['Konsultasi dengan 20+ dokter spesialis', 'Sistem pendaftaran online', 'Antrian digital real-time', 'Hasil pemeriksaan hari yang sama', 'Farmasi terintegrasi', 'Pembayaran cashless'],
        doctors: [
            { name: 'Dr. Andi Prasetyo', specialty: 'Dokter Umum', schedule: 'Senin - Jumat, 08:00 - 14:00' },
            { name: 'Dr. Linda Susanti', specialty: 'Dokter Umum', schedule: 'Senin - Jumat, 14:00 - 20:00' },
            { name: 'Dr. Ahmad Wijaya, Sp.JP', specialty: 'Kardiologi', schedule: 'Senin, Rabu, Jumat, 09:00 - 14:00' },
        ],
        facilities: ['Ruang tunggu nyaman ber-AC', 'Area parkir luas', 'Kantin', 'Mushola', 'ATM Center'],
        procedures: ['Pendaftaran', 'Pemeriksaan Tanda Vital', 'Konsultasi Dokter', 'Pemeriksaan Penunjang', 'Pengambilan Obat'],
    },
    inpatient: {
        title: 'Rawat Inap',
        description: 'Fasilitas perawatan menginap dengan berbagai kelas kamar',
        fullDescription: 'Fasilitas rawat inap kami menyediakan berbagai pilihan kelas kamar mulai dari VIP hingga kelas 3. Setiap kamar dilengkapi dengan fasilitas modern dan perawatan 24 jam oleh tenaga medis profesional.',
        icon: 'Building2',
        color: 'from-secondary to-secondary-light',
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop',
        features: ['Kamar VIP, Kelas 1, 2, dan 3', 'Perawatan 24 jam oleh perawat profesional', 'Menu nutrisi khusus dari ahli gizi', 'Fasilitas untuk keluarga pasien', 'TV, AC, dan WiFi di setiap kamar', 'Tombol panggil perawat'],
        doctors: [
            { name: 'Dr. Ratna Sari, Sp.PD', specialty: 'Penyakit Dalam', schedule: 'Visite harian' },
            { name: 'Dr. Budi Santoso, Sp.B', specialty: 'Bedah Umum', schedule: 'Visite harian' },
        ],
        facilities: ['Kamar mandi dalam', 'TV LED', 'AC', 'WiFi gratis', 'Sofa bed untuk penunggu'],
        procedures: ['Admisi', 'Perawatan Harian', 'Visite Dokter', 'Pemeriksaan Berkala', 'Discharge Planning'],
    },
    emergency: {
        title: 'Instalasi Gawat Darurat',
        description: 'Layanan darurat 24 jam dengan respon cepat',
        fullDescription: `Unit Gawat Darurat (UGD) RS Soewandhie beroperasi 24 jam dengan tim medis terlatih dan peralatan lengkap untuk menangani berbagai kondisi darurat. Sistem triase memastikan pasien ditangani sesuai tingkat kegawatdaruratan.`,
        icon: 'AlertCircle',
        color: 'from-destructive to-destructive/80',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
        features: ['Layanan 24 jam non-stop', 'Tim medis terlatih ACLS/ATLS', 'Ambulans siaga dengan peralatan lengkap', 'Sistem triase 5 level', 'Resusitasi dan stabilisasi', 'Akses langsung ke OK dan ICU'],
        doctors: [
            { name: 'Dr. Emergency Team', specialty: 'Tim Jaga IGD', schedule: '24 Jam' },
        ],
        facilities: ['Ruang resusitasi', 'Ruang tindakan', 'Ruang observasi', 'Ambulans 3 unit', 'Helipad'],
        procedures: ['Triase', 'Stabilisasi', 'Pemeriksaan Awal', 'Penanganan Darurat', 'Transfer/Rawat Inap'],
    },
    intensive: {
        title: 'Perawatan Intensif',
        description: 'ICU, ICCU, NICU, dan PICU dengan monitoring 24 jam',
        fullDescription: 'Unit Perawatan Intensif menyediakan perawatan khusus untuk pasien dengan kondisi kritis. Dilengkapi dengan peralatan monitoring canggih dan rasio perawat-pasien yang optimal untuk memastikan perawatan terbaik.',
        icon: 'Activity',
        color: 'from-primary-dark to-primary',
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop',
        features: ['ICU (Intensive Care Unit) 20 bed', 'ICCU (Cardiac Care) 10 bed', 'NICU (Neonatal) 15 bed', 'PICU (Pediatric) 8 bed', 'Monitoring 24 jam', 'Ventilator dan life support lengkap'],
        doctors: [
            { name: 'Dr. Intensivist Team', specialty: 'Tim ICU', schedule: '24 Jam' },
        ],
        facilities: ['Monitor bedside', 'Ventilator', 'Infusion pump', 'Defibrilator', 'CRRT'],
        procedures: ['Admission Criteria', 'Monitoring Ketat', 'Daily Assessment', 'Weaning', 'Step Down'],
    },
    supporting: {
        title: 'Penunjang Medis',
        description: 'Laboratorium, radiologi, farmasi, dan rehabilitasi medik',
        fullDescription: 'Layanan penunjang medis lengkap meliputi laboratorium dengan berbagai pemeriksaan, radiologi dengan CT Scan dan MRI, farmasi 24 jam, serta unit rehabilitasi medik untuk pemulihan optimal.',
        icon: 'FlaskConical',
        color: 'from-secondary to-primary',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=500&fit=crop',
        features: ['Laboratorium terakreditasi', 'Radiologi: X-Ray, USG, CT Scan, MRI', 'Farmasi 24 jam', 'Rehabilitasi medik lengkap', 'Bank darah', 'Hemodialisa'],
        doctors: [
            { name: 'Dr. Laboratorium Team', specialty: 'Patologi Klinik', schedule: '24 Jam' },
            { name: 'Dr. Radiologi Team', specialty: 'Radiologi', schedule: '24 Jam' },
        ],
        facilities: ['Lab lengkap', 'CT Scan 128 slice', 'MRI 3T', 'USG 4D', 'Fisioterapi'],
        procedures: ['Pengambilan Sampel', 'Pemeriksaan', 'Analisis', 'Pelaporan', 'Konsultasi Hasil'],
    },
    specialist: {
        title: 'Klinik Spesialis',
        description: 'Lebih dari 20 klinik spesialis dengan dokter berpengalaman',
        fullDescription: `RS Soewandhie memiliki lebih dari 20 klinik spesialis yang melayani berbagai kebutuhan kesehatan. Setiap klinik dipimpin oleh dokter spesialis berpengalaman dengan jadwal praktik yang fleksibel.`,
        icon: 'Heart',
        color: 'from-accent to-accent/80',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=500&fit=crop',
        features: ['Jantung dan Pembuluh Darah', 'Penyakit Dalam', 'Bedah (Umum, Ortopedi, Saraf, dll)', 'Kebidanan dan Kandungan', 'Anak', 'Mata, THT, Kulit, Gigi'],
        doctors: [
            { name: 'Dr. Ahmad Wijaya, Sp.JP', specialty: 'Kardiologi', schedule: 'Senin, Rabu, Jumat' },
            { name: 'Dr. Siti Rahayu, Sp.A', specialty: 'Anak', schedule: 'Senin - Jumat' },
            { name: 'Dr. Maya Putri, Sp.OG', specialty: 'Kebidanan', schedule: 'Senin - Jumat' },
        ],
        facilities: ['Ruang periksa modern', 'Alat diagnostik lengkap', 'Minor surgery room'],
        procedures: ['Registrasi', 'Anamnesis', 'Pemeriksaan Fisik', 'Diagnostik', 'Terapi/Tindakan'],
    }
};

const SETTINGS_CACHE_KEY = 'hospital_settings_cache';

const getCachedSettings = (): HospitalSettings | null => {
    try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null;
    }
};

export const useSettings = () => {
    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const result = await api.settings.getAll();

            const hospitalSettings = result?.hospital_settings || {};
            const appearanceSettings = result?.appearance_settings || {};
            const externalLinks = result?.external_links || {};
            const profileSettings = result?.profile_settings || {};
            const serviceStandards = result?.service_standards || {};
            const innovations = result?.innovations || [];
            const ziSettings = result?.zi_settings || {};

            const mapped = {
                ...hospitalSettings,
                logoUrl: appearanceSettings?.logoUrl,
                faviconUrl: appearanceSettings?.faviconUrl,
                external_links: externalLinks,
                profile_settings: profileSettings,
                service_standards: serviceStandards,
                innovations: innovations,
                zi_settings: ziSettings,
                org_structure: {
                    leaders: result?.org_structure?.leaders || [],
                    divisions: result?.org_structure?.divisions || []
                },
                service_pages: {
                    outpatient: result?.service_page_outpatient || DEFAULT_SERVICE_PAGES.outpatient,
                    inpatient: result?.service_page_inpatient || DEFAULT_SERVICE_PAGES.inpatient,
                    emergency: result?.service_page_emergency || DEFAULT_SERVICE_PAGES.emergency,
                    intensive: result?.service_page_intensive || DEFAULT_SERVICE_PAGES.intensive,
                    supporting: result?.service_page_supporting || DEFAULT_SERVICE_PAGES.supporting,
                    specialist: result?.service_page_specialist || DEFAULT_SERVICE_PAGES.specialist,
                },
                announcement_bar: externalLinks?.announcement_bar || {
                    enabled: false,
                    text: "",
                    type: "info"
                },
                announcement_popup: externalLinks?.announcement_popup || {
                    enabled: false,
                    title: "",
                    content: ""
                }
            } as HospitalSettings;

            // Persist to cache
            localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(mapped));

            return mapped;
        },
        placeholderData: getCachedSettings() || undefined,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const defaultSettings: HospitalSettings = {
        name: "RS Soewandhie",
        tagline: "Melayani dengan Sepenuh Hati",
        email: "info@rs-soewandhie.com",
        phone: "(031) 3717141",
        whatsapp: "6281234567890",
        address: "Jl. Tambak Rejo No.45-47, Simokerto, Surabaya",
        website: "https://rs-soewandhie.surabaya.go.id",
        description: "Rumah Sakit Umum Daerah milik Pemerintah Kota Surabaya",
        external_links: {
            zonaIntegritas: "",
            wbs: "",
            lapor: ""
        },
        org_structure: {
            leaders: [],
            divisions: []
        },
        service_pages: DEFAULT_SERVICE_PAGES,
        announcement_bar: {
            enabled: false,
            text: "",
            type: "info"
        },
        announcement_popup: {
            enabled: false,
            title: "",
            content: ""
        }
    };

    return {
        settings: settings || defaultSettings,
        isLoading,
        error
    };
};
