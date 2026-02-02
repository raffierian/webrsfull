import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type FetchOptions = RequestInit & {
    requireAuth?: boolean;
};

async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (requireAuth) {
        const token = localStorage.getItem('adminToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }

        return data.data; // Assuming backend returns { success: true, data: ... }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const api = {
    // Auth
    auth: {
        login: (credentials: any) => fetcher<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            requireAuth: false
        }),
        register: (data: any) => fetcher<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            requireAuth: false
        }),
        me: () => fetcher<any>('/auth/me'),
        updateProfile: (data: any) => fetcher<any>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        setup2FA: () => fetcher<any>('/auth/2fa/setup', { method: 'POST' }),
        verify2FA: (code: string) => fetcher<any>('/auth/2fa/verify', {
            method: 'POST',
            body: JSON.stringify({ code })
        }),
        disable2FA: () => fetcher<any>('/auth/2fa/disable', { method: 'POST' }),
    },

    // Admin Dashboard
    dashboard: {
        stats: () => fetcher<any>('/admin/dashboard/stats'),
        updateStats: (data: any) => fetcher<any>('/admin/dashboard/stats', { method: 'POST', body: JSON.stringify(data) }),
        visitTrends: () => fetcher<any>('/admin/dashboard/visits'),
        poliDistribution: () => fetcher<any>('/admin/dashboard/poli'),
    },

    // Doctors
    doctors: {
        getAllPublic: (params?: string) => fetcher<any>(`/doctors${params ? `?${params}` : ''}`, { requireAuth: false }),
        getAllAdmin: () => fetcher<any>('/doctors?limit=100'), // Use public endpoint for list, admin routes for CRUD are separate or use public? Admin routes don't have GET.
        create: (data: any) => fetcher<any>('/admin/doctors', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/doctors/${id}`, { method: 'DELETE' }),
        import: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('adminToken');

            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            return fetch(`${API_URL}/admin/doctors/import`, {
                method: 'POST',
                body: formData,
                headers
            }).then(res => res.json()).then(data => {
                if (!data.success) throw new Error(data.message);
                return data.data;
            });
        },
    },

    // Appointments
    appointments: {
        getAllAdmin: (params?: string) => fetcher<any>(`/admin/appointments${params ? `?${params}` : ''}`),
        getMy: (params?: string) => fetcher<any>(`/appointments${params ? `?${params}` : ''}`),
        updateStatus: (id: string, status: string, notes?: string) => fetcher<any>(`/admin/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes })
        }),
        create: (data: any) => fetcher<any>('/appointments', { method: 'POST', body: JSON.stringify(data), requireAuth: true }), // Require auth for patient booking
    },

    // Articles
    articles: {
        getAllPublic: (params?: string) => fetcher<any>(`/articles${params ? `?${params}` : ''}`, { requireAuth: false }),
        getBySlug: (slug: string) => fetcher<any>(`/articles/${slug}`, { requireAuth: false }),
        getAllAdmin: () => fetcher<any>('/admin/articles'),
        create: (data: any) => fetcher<any>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/articles/${id}`, { method: 'DELETE' }),
        togglePublish: (id: string) => fetcher<any>(`/admin/articles/${id}/publish`, { method: 'PUT' }),
    },

    // Services
    services: {
        getAllPublic: () => fetcher<any>('/services', { requireAuth: false }),
        getAllAdmin: () => fetcher<any>('/admin/services'),
        create: (data: any) => fetcher<any>('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/services/${id}`, { method: 'DELETE' }),
    },

    // Complaints / Contact
    complaints: {
        create: (data: any) => fetcher<any>('/complaints', { method: 'POST', body: JSON.stringify(data), requireAuth: false }),
        trackById: (id: string) => fetcher<any>(`/complaints/track/${id}`, { requireAuth: false }),
        getAllAdmin: (params?: string) => fetcher<any>(`/admin/complaints${params ? `?${params}` : ''}`),
        respond: (id: string, data: any) => fetcher<any>(`/admin/complaints/${id}/respond`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/complaints/${id}`, { method: 'DELETE' }),
    },
    // Careers
    careers: {
        getAllPublic: () => fetcher<any>('/careers', { requireAuth: false }),
        getAllAdmin: () => fetcher<any>('/admin/careers'),
        getBySlug: (slug: string) => fetcher<any>(`/careers/${slug}`, { requireAuth: false }),
        create: (data: any) => fetcher<any>('/admin/careers', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/careers/${id}`, { method: 'DELETE' }),
        apply: (data: any) => fetcher<any>('/careers/apply', { method: 'POST', body: JSON.stringify(data), requireAuth: false }),
    },

    // Settings
    settings: {
        getAll: () => fetcher<any>('/settings'),
        update: (data: any) => fetcher<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // Surveys (Real Data)
    surveys: {
        getStats: (period: string = 'month') => fetcher<any>(`/surveys/stats?period=${period}`),
        submit: (data: any) => fetcher<any>('/surveys', { method: 'POST', body: JSON.stringify(data), requireAuth: false }),
    },

    // Admin Users Management
    adminUsers: {
        getAll: (params?: string) => fetcher<any>(`/admin/users${params ? `?${params}` : ''}`),
        create: (data: any) => fetcher<any>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/users/${id}`, { method: 'DELETE' }),
    },

    // Health Promotion (PKRS)
    healthPromos: {
        getAllPublic: (params?: string) => fetcher<any>(`/health-promos${params ? `?${params}` : ''}`, { requireAuth: false }),
        getAllAdmin: (params?: string) => fetcher<any>(`/health-promos${params ? `?${params}` : ''}`),
        create: (data: any) => fetcher<any>('/health-promos', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/health-promos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/health-promos/${id}`, { method: 'DELETE' }),
    },

    // Tariffs
    tariffs: {
        getAll: () => fetcher<any>('/tariffs', { requireAuth: false }),
        getAllAdmin: () => fetcher<any>('/admin/tariffs'),
        create: (data: any) => fetcher<any>('/admin/tariffs', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/tariffs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/tariffs/${id}`, { method: 'DELETE' }),
        import: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('adminToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/tariffs/import`, {
                method: 'POST',
                body: formData,
                headers
            }).then(res => res.json()).then(data => {
                if (!data.success) throw new Error(data.message);
                return data.data;
            });
        },
    },

    // Trainings
    trainings: {
        getAllPublic: () => fetcher<any[]>('/training', { requireAuth: false }),
        getBySlug: (slug: string) => fetcher<any>(`/training/${slug}`, { requireAuth: false }),
        getAllAdmin: () => fetcher<any[]>('/admin/trainings'),
        create: (data: any) => fetcher<any>('/admin/trainings', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/admin/trainings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/admin/trainings/${id}`, { method: 'DELETE' }),
    },

    // Homepage Content
    homepage: {
        getSection: (section: string) => fetcher<any>(`/homepage/${section}`, { requireAuth: false }),
        updateSection: (section: string, data: any) => fetcher<any>(`/homepage/${section}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    },

    // Upload
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('adminToken');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers
        }).then(res => res.json()).then(data => {
            if (!data.success) throw new Error(data.message);
            return data.data; // { url: ... }
        });
    },

    // Inpatient Rooms
    inpatientRooms: {
        getAll: (params?: string) => fetcher<any>(`/inpatient-rooms${params ? `?${params}` : ''}`, { requireAuth: false }),
        getSummary: () => fetcher<any>('/inpatient-rooms/summary', { requireAuth: false }),
        getById: (id: string) => fetcher<any>(`/inpatient-rooms/${id}`, { requireAuth: false }),
        create: (data: any) => fetcher<any>('/inpatient-rooms', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/inpatient-rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        updateStatus: (id: string, data: any) => fetcher<any>(`/inpatient-rooms/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/inpatient-rooms/${id}`, { method: 'DELETE' }),
        import: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('adminToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            return fetch(`${API_URL}/inpatient-rooms/import`, {
                method: 'POST',
                body: formData,
                headers
            }).then(res => res.json()).then(data => {
                if (!data.success) throw new Error(data.message);
                return data.data;
            });
        },
    },

    // Search
    search: {
        global: (query: string) => fetcher<any>(`/search?q=${encodeURIComponent(query)}`, { requireAuth: false }),
    },

    // Roles
    roles: {
        getAll: () => fetcher<any[]>('/roles'),
        create: (data: any) => fetcher<any>('/roles', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetcher<any>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetcher<any>(`/roles/${id}`, { method: 'DELETE' }),
    },

    // Role Menus
    roleMenus: {
        getByRole: (role: string) => fetcher<string[]>(`/role-menus/${role}`),
        update: (role: string, menus: string[]) => fetcher<any>(`/role-menus/${role}`, {
            method: 'PUT',
            body: JSON.stringify({ menus })
        }),
        getMy: () => fetcher<string[]>('/role-menus/my-menus'),
    },

    // Chat AI
    chat: {
        sendMessage: (message: string, history?: any[]) => fetcher<any>('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history }),
            requireAuth: false
        }),
    }
};
