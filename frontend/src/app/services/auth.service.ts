import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthResponse } from '../models/auth.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiurl + 'auth';

    // Estado reactivo del usuario
    currentUser = signal<string | null>(localStorage.getItem('breath-user'));

    constructor(private http: HttpClient) { }

    // Headers con el Token para peticiones privadas
    get authHeaders() {
        const token = localStorage.getItem('breath-token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // --- ACCIONES ---

    // ✅ Tipado estricto en el retorno
    login(username: string, pass: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password: pass }).pipe(
            tap(response => {
                if (response.token && response.user) {
                    localStorage.setItem('breath-token', response.token);
                    localStorage.setItem('breath-user', response.user.username);
                    this.currentUser.set(response.user.username);
                }
            })
        );
    }

    register(username: string, email: string, pass: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password: pass }).pipe(
            catchError(err => {
                // Si el backend devuelve HTML (error 500 o warning), lo capturamos
                console.error("Error registro:", err);
                if (err.status === 200 && err.error && err.error.text) {
                    // A veces Angular parsea mal si el PHP devuelve texto plano
                    return throwError(() => new Error("Error inesperado del servidor. Revisa la consola."));
                }
                return throwError(() => err);
            })
        );
    }

    logout() {
        localStorage.removeItem('breath-token');
        localStorage.removeItem('breath-user');
        this.currentUser.set(null);
    }
}