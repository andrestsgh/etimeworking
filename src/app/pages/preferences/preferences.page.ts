import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SharedService } from 'src/app/services/shared.service';

export interface Preferences {
  notifications: boolean;
  geolocation: boolean;
}

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})

export class PreferencesPage {
  // Por defecto las notificaciones están desactivadas y la geolocalización activada
  preferences: Preferences = {
    notifications: false,
    geolocation: true
  };

  constructor(private storage: Storage,
              private sharedService: SharedService) {
    this.initStorage();
  }
  
  // Inicia el almacenamiento storage-angular
  async initStorage() {
    await this.storage.create();
    this.loadPreferences();
  }

  // Carga las preferencias después de inicializar el Storage
  async loadPreferences() {
    // Carga preferencias personales para usuario que se conecta a la aplicación usando su email como clave
    // y como valor las preferencias en un string JSON
    const user = localStorage.getItem('user');
    if (user) {
      const storedPreferences = await this.storage.get((JSON.parse(user)).email);
      // Actualiza con las preferencias cargadas, si existen
      if (storedPreferences) {
        this.preferences = storedPreferences;
        console.log("PREFERENCIAS cargadas "+(JSON.parse(user)).email+"->",this.preferences);
      }
    }
  }

  // Guarda las preferencias
  async savePreferences() {
    const user = localStorage.getItem('user');
    if (user) {
      await this.storage.set((JSON.parse(user)).email, this.preferences);
      // Actualiza las preferencias compartidas con las vistas durante la ejecución actual
      this.sharedService.sharedPreferences = this.preferences;
      console.log("PREFERENCIAS guardadas",(JSON.parse(user)).email);
    }
  }

  // Gestiona el estado de las notificaciones
  toggleNotifications() {
    this.preferences.notifications = !this.preferences.notifications;
    this.savePreferences();
  }

  // Gestiona el estado de la geolocalización
  toggleGeolocation() {
    this.preferences.geolocation = !this.preferences.geolocation;
    this.savePreferences();
  }
}
