// Client-side API Service — replaces Dexie calls with fetch to Vercel serverless functions

export interface Log {
    id: string;
    timestamp: string;
    dateObj: string; // ISO string from server
    eventName: string;
    category: string;
    intensity: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface Category {
    id: string;
    name: string;
    target: string;
    enabled: boolean;
    color: string;
}

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        let errorMsg = 'API request failed';
        try {
            const errorData = await res.json();
            errorMsg = `Server Error (${res.status}): ${errorData.error || res.statusText}`;
        } catch {
            errorMsg = `Network Error (${res.status}): ${res.statusText}`;
        }
        throw new Error(errorMsg);
    }
    return res.json();
}

export const api = {
    logs: {
        getAll: (categoryId?: string) =>
            request<Log[]>(`/logs${categoryId && categoryId !== 'all' ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}`),

        create: (data: Omit<Log, 'id'>) =>
            request<Log>('/logs', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: Partial<Log>) =>
            request<Log>('/logs', {
                method: 'PUT',
                body: JSON.stringify({ id, ...data }),
            }),

        delete: (id: string) =>
            request<{ success: boolean }>(`/logs?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            }),
    },

    categories: {
        getAll: () => request<Category[]>('/categories'),

        create: (data: Omit<Category, 'id'>) =>
            request<Category>('/categories', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: Partial<Category>) =>
            request<Category>('/categories', {
                method: 'PUT',
                body: JSON.stringify({ id, ...data }),
            }),

        delete: (id: string) =>
            request<{ success: boolean }>(`/categories?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            }),
    },

    seed: () =>
        request<{ seeded: boolean }>('/seed', { method: 'POST' }),
};
