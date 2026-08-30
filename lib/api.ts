// Client-side API Service — replaces Dexie calls with fetch to Vercel serverless functions

export interface Log {
    id: string;
    timestamp: string;
    dateObj: string; // ISO string from server
    eventName: string;
    category: string;
    categoryId?: string; // clave foránea; el servidor la resuelve por nombre si falta
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

export interface TimerSession {
    id?: string;
    categoryId: string;
    category: string;
    startedAt: string;
    endedAt: string;
    durationSec: number;
    note?: string;
}

export class ApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'ApiError';
    }
}

const BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        let message = res.statusText || 'La petición ha fallado';
        try {
            const body = await res.json();
            if (body?.error) message = body.error;
        } catch {
            /* respuesta sin JSON: nos quedamos con statusText */
        }
        throw new ApiError(message, res.status);
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

    timerSessions: {
        getAll: (categoryId?: string) =>
            request<TimerSession[]>(`/timer-sessions${categoryId && categoryId !== 'all' ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}`),

        create: (data: Omit<TimerSession, 'id'>) =>
            request<TimerSession>('/timer-sessions', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: Partial<TimerSession>) =>
            request<TimerSession>('/timer-sessions', {
                method: 'PUT',
                body: JSON.stringify({ id, ...data }),
            }),

        delete: (id: string) =>
            request<{ success: boolean }>(`/timer-sessions?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            }),
    },

    seed: () =>
        request<{ seeded: boolean }>('/seed', { method: 'POST' }),

    auth: {
        status: () => request<{ authenticated: boolean }>('/auth'),

        login: (pin: string) =>
            request<{ ok: true }>('/auth', { method: 'POST', body: JSON.stringify({ pin }) }),

        changePin: (currentPin: string, newPin: string) =>
            request<{ ok: true }>('/auth', { method: 'PUT', body: JSON.stringify({ currentPin, newPin }) }),

        logout: () => request<{ ok: true }>('/auth', { method: 'DELETE' }),
    },
};
