import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Crear cuenta</h1>
        <p class="error" *ngIf="error">{{ error }}</p>
        <input type="email"
               [(ngModel)]="email"
               placeholder="Email"
               autocomplete="email"/>
        <input type="password"
               [(ngModel)]="password"
               placeholder="Contraseña (mín. 8 caracteres)"/>
        <input type="password"
               [(ngModel)]="confirm"
               placeholder="Confirmar contraseña"/>
        <button (click)="register()" [disabled]="loading">
          {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
        <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  confirm = '';
  error = '';
  loading = false;

  register() {
    if (!this.email || !this.password) {
      this.error = 'Rellena todos los campos';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/calendar']),
      error: e => {
        this.error = e.error?.message || 'Error al registrar';
        this.loading = false;
      }
    });
  }
}
