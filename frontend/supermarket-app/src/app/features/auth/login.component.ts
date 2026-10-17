import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage: string = '';

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        const rol = response.usuario.rol;
        // Redirección inteligente basada en el rol devuelto por FastAPI
        if (rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (rol === 'BODEGA') {
          this.router.navigate(['/bodega']);
        } else if (rol === 'CAJERO') {
          this.router.navigate(['/cajero']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Credenciales inválidas o error de conexión.';
      }
    });
  }
}