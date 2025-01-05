import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { // Redirecciona a login si 
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { // La única ruta que no está gestionada por el guard es login
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'fichar',
    loadChildren: () => import('./pages/fichar/fichar.module').then( m => m.FicharPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'preferences',
    loadChildren: () => import('./pages/preferences/preferences.module').then( m => m.PreferencesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./pages/reports/reports.module').then( m => m.ReportsPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'map',
    loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
