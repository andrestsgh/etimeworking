import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Preferences } from '../pages/preferences/preferences.page';

export interface ResponseError {
  statusCode: number;
  message: string;
  messageDetail: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable({
  providedIn: 'root'
})

/*******
 * Esta clase es usada para compartir datos y servicios comunes entre los diferentes 
 * componentes de la aplicación.
 */
export class SharedService {
  // Spinner de carga
  loading: HTMLIonLoadingElement | null = null;
  // Contrato seleccionado en los desplegables, para volver a cargarlo si cambiamos de vista
  selectedOptionContract: number | null = null;
  // Host servidor donde están alojados los servicios
  host: string = 'https://etimeworking.kozow.com';

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  sharedPreferences: Preferences = {
    notifications: false,
    geolocation: true
  };

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) { }
  
  /***** 
   * showLoading: Muestra el spinner de carga parametizado, por defecto el mensaje es Cargando y 
   * se podrá ocultar al pulsar fuera */
  async showLoading(message: string = 'Cargando...', backdropDismiss: boolean = true) {
    // Solo muestra el loading si no hay uno activo
    if (!this.loadingSubject.value) {
      this.loadingSubject.next(true);
      this.loading = await this.loadingController.create({
        message,
        spinner: 'crescent',
        backdropDismiss: backdropDismiss,
      });
      await this.loading.present();
    }
  }

  /***** hideLoading: Oculta el spinner de carga */
  async hideLoading() {
    // Espera a que el loading actual se cierre antes de cambiar el estado
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
      this.loadingSubject.next(false);
    }
  }

  /***** errorLog: Muestra los mensajes de error del tipo ResponseError por consola */
  errorLog(error: ResponseError) {
    console.error('path:', error.path);
    console.error('timestamp:', error.timestamp);
    console.error('message:', error.message);
    console.error('messageDetail:', error.messageDetail);
    console.error('statusCode:', error.statusCode);
    // Devuelve el error para que pueda ser gestionado fuera
    return throwError(error);
  }
  
  /***** handleError: Muestra los mensajes de error del tipo HttpErrorResponse por consola */
  handleError(error: HttpErrorResponse) {
    console.log('ERROR HttpErrorResponse:', error);
    // Devuelve el error para que pueda ser gestionado fuera
    return throwError(error);
  }

  /***** showToast: Muestra por pantalla un mensaje temporal parametizado, por fecto con un tiempo de 1 segundo y en la parte inferior de la pantalla */
  async showToast(message: string, color: string, duration: number = 1000, position: any = "bottom") {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position,
      color: color,
    });
    await toast.present();
  }
}
