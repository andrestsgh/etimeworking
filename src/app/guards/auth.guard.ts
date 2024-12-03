import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Como no se trata de una clase, la única manera que he encontrado
  // de inyectar la dependencia Router es esta.
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  const access_token = localStorageService.get('access_token');

  if (access_token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
