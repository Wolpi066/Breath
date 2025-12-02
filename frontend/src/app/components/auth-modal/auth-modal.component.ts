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

    // Campos del formulario
    username = '';
    password = '';
    email = '';
    error = '';

    toggleMode() {
        this.mode.set(this.mode() === 'login' ? 'register' : 'login');
        this.error = '';
        this.username = '';
        this.password = '';
        this.email = '';
    }

    onSubmit() {
        this.error = '';
        if (this.mode() === 'login') {
            if (!this.username || !this.password) {
                this.error = 'Por favor completa todos los campos';
                return;
            }
            this.login.emit({ user: this.username, pass: this.password });
        } else {
            if (!this.username || !this.email || !this.password) {
                this.error = 'Por favor completa todos los campos';
                return;
            }
            if (this.password.length < 6) {
                this.error = 'La contraseña debe tener al menos 6 caracteres';
                return;
            }
            this.register.emit({ user: this.username, email: this.email, pass: this.password });
        }
    }

    onLogout() {
        this.logout.emit();
    }
}