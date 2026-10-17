import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  let user = authService.currentUser();

  // 🛡️ Blindaje contra recargas: Si hay token pero el usuario está en null (por SSR o ciclo de vida), lo rescatamos del localStorage
  if (token && !user) {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
          authService.currentUser.set(user); // Sincronizamos el signal al instante
        } catch (e) {
          console.error('Error al recuperar usuario del storage', e);
        }
      }
    }
  }

  // Validar si tenemos sesión completa
  if (token && user) {
    // Validar roles si la ruta exige alguno en específico
    const expectedRoles = route.data?.['roles'] as string[];
    if (expectedRoles && !expectedRoles.includes(user.rol)) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  }

  // Si definitivamente no hay nada válido, mandar al login
  router.navigate(['/login']);
  return false;
};