export interface User {
    id: string;
    username: string;
    role: 'admin' | 'user';
    email?: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
    error?: string;
}