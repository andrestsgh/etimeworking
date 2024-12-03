import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { AuthService } from './services/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  public appPages = [
    { title: 'Fichar', url: '/fichar', icon: 'archive' },
    { title: 'Informes', url: '/folder/Informes', icon: 'document-text' },
    { title: 'Opciones', url: '/folder/Opciones', icon: 'settings' },
  ];

  public userPhoto: string = 'assets/img/user-default.png'; // Ruta de la foto por defecto de los usuarios

  constructor(private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private menuCtrl: MenuController){
  }

  logout(): void {
    /*this.localStorageService.remove('user_id');
    this.localStorageService.remove('access_token');
    this.router.navigate(['login']);*/
    /*
    const headerInfo: HeaderMenus = {
      showAuthSection: false,
      showNoAuthSection: true,
    };
    this.headerMenusService.headerManagement.next(headerInfo);
    */
    this.authService.logout().subscribe(() => {
      this.router.navigate(['login']);          
      this.menuCtrl.close();
    });
  }
}
