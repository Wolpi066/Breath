import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

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

    login(username: string, pass: string): Observable<any> {
        // POST a http://localhost/Breath/backend/auth/login
        return this.http.post<any>(`${this.apiUrl}/login`, { username, password: pass }).pipe(
            tap(response => {
                if (response.token) {
                    // Guardamos sesión real
                    localStorage.setItem('breath-token', response.token);
                    localStorage.setItem('breath-user', response.user.username);
                    this.currentUser.set(response.user.username);
                }
            })
        );
    }

    register(username: string, email: string, pass: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password: pass });
    }

    logout() {
        localStorage.removeItem('breath-token');
        localStorage.removeItem('breath-user');
        this.currentUser.set(null);
    }
}