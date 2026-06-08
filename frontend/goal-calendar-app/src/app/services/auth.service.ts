import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  register(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/register`, {
        email,
        password
      })
      .pipe(tap(r => sessionStorage.setItem('token', r.token)));
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/login`, {
        email,
        password
      })
      .pipe(tap(r => sessionStorage.setItem('token', r.token)));
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }
}
