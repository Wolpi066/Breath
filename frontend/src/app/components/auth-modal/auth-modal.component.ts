import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-auth-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './auth-modal.component.html',
    styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
    @Input() currentUser: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() login = new EventEmitter<{ user: string, pass: string }>();
    @Output() register = new EventEmitter<{ user: string, email: string, pass: string }>();
    @Output() logout = new EventEmitter<void>();

    mode = signal<'login' | 'register'>('login');

    username = '';
    password = '';
    email = '';
    error = '';
    successMessage = ''; // ✅ Nuevo estado para feedback positivo

    toggleMode() {
        this.mode.set(this.mode() === 'login' ? 'register' : 'login');
        this.resetForm();
    }

    resetForm() {
        this.error = '';
        this.successMessage = ''; // Limpiamos éxito también
        this.username = '';
        this.password = '';
        this.email = '';
    }

    // ✅ Método llamado por el padre cuando el registro sale bien
    showRegisterSuccess() {
        this.mode.set('login'); // Cambiar a login
        this.resetForm(); // Limpiar campos
        this.successMessage = 'Cuenta creada con éxito. Inicia sesión.'; // Mostrar mensaje
    }

    onSubmit() {
        this.error = '';
        this.successMessage = ''; // Limpiar mensaje previo al intentar de nuevo

        if (this.mode() === 'login') {
            if (!this.username || !this.password) {
                this.error = 'Completa todos los campos'; return;
            }
            this.login.emit({ user: this.username, pass: this.password });
        } else {
            if (!this.username || !this.email || !this.password) {
                this.error = 'Completa todos los campos'; return;
            }
            if (this.username.length < 3) {
                this.error = 'El usuario debe tener al menos 3 caracteres'; return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.error = 'Email inválido'; return;
            }
            if (this.password.length < 6) {
                this.error = 'La contraseña debe tener al menos 6 caracteres'; return;
            }

            this.register.emit({ user: this.username, email: this.email, pass: this.password });
        }
    }

    onLogout() {
        this.logout.emit();
    }
}