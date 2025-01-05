import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MenuController, Platform } from '@ionic/angular';
import { AuthDTO } from './models/auth.dto';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  public appPages = [
    { title: 'Fichar', url: '/fichar', icon: 'archive' },
    { title: 'Informes', url: '/reports', icon: 'document-text' },
    { title: 'Opciones', url: '/preferences', icon: 'settings' },
  ];

  user: AuthDTO | null = null;

  // Se subscribe a los cambios del usuario para avisar al menú lateral
  constructor(private router: Router,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform){
      this.authService.currentUser$.subscribe((user) => {
        this.user = user;
      });
      this.initializeBackButton();
  }

  /***** initializeBackButton: Gestiona el botón atrás o volver */
  initializeBackButton() {
    // Cuando la aplicación esté cargada y lista
    this.platform.ready().then(() => {
      // Captura del evento del botón atrás con máxima prioridad
      this.platform.backButton.subscribeWithPriority(-1, () => {
        // Si estamos en login sale de la aplicación
        if (this.router.url === '/login') {
          App.exitApp();
        } else {
          // Navega hacia atrás en el historial
          window.history.back();
        }
      });
    });
  }

  /***** logout: Elimina los datos del usuario */
  logout(): void {
    this.authService.logout().subscribe(() => {
      // Cierra el menú lateral en caso de estar en la vista móvil, 
      // con el reload se asegura que cualquier valor residual sea eliminado de las vistas
      this.menuCtrl.close();
      window.location.reload();
    });
  }
}
