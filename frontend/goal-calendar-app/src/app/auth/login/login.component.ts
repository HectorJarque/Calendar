import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Iniciar sesión</h1>
        <p class="error" *ngIf="error">{{ error }}</p>
        <input type="email"
               [(ngModel)]="email"
               placeholder="Email"
               autocomplete="email"/>
        <input type="password"
               [(ngModel)]="password"
               placeholder="Contraseña"
               autocomplete="current-password"/>
        <button (click)="login()" [disabled]="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p>¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  login() {
    if (!this.email || !this.password) {
      this.error = 'Rellena todos los campos';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/calendar']),
      error: e => {
        this.error = e.error?.message || 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}
