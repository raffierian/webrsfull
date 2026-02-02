import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface HospitalSettings {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    website: string;
    description: string;
    emergencyPhone?: string;
    operatingHours?: string;
    logoUrl?: string;
    faviconUrl?: string;
    external_links?: {
        zonaIntegritas?: string;
        wbs?: string;
        lapor?: string;
        enableChatbot?: boolean;
        enableWhatsapp?: boolean;
        consultationEnabled?: boolean;
        enablePatientPortal?: boolean;
    };
    profile_settings?: {
        vision?: string;
        mission?: string;
        moto?: string;
        maklumat?: string;
        about?: string;
        history?: string;
        values?: string;
    };
}

export const useSettings = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const result = await api.settings.getAll();
            // Backend returns object with keys like 'hospital_settings', 'notification_settings', 'appearance_settings'
            const hospitalSettings = result?.hospital_settings || {};
            const appearanceSettings = result?.appearance_settings || {};
            const externalLinks = result?.external_links || {};
            const profileSettings = result?.profile_settings || {};

            return {
                ...hospitalSettings,
                logoUrl: appearanceSettings.logoUrl,
                faviconUrl: appearanceSettings.faviconUrl,
                external_links: externalLinks,
                profile_settings: profileSettings
            } as HospitalSettings;
        },
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
        }
    };

    return {
        settings: data || defaultSettings,
        isLoading,
        error
    };
};
