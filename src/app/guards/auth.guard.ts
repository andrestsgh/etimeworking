import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Como no se trata de una clase, la única manera que he encontrado
  // de inyectar la dependencia Router es esta.
  const router = inject(Router);

  // Uso de localStorage para buscar al usuario autenticado y comprobar si tiene un token
  const storedUser = localStorage.getItem('user');

  if (storedUser && JSON.parse(storedUser).token) {
    return true;
  }
  // Si no existe el usuario o el token devolvemos la vista de login
  router.navigate(['/login']);
  return false;
};
