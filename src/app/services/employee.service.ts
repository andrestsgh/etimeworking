import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private urlApi: string;

  // Monta la url de consulta a la api
  constructor(private http: HttpClient, 
              private sharedService: SharedService) {
    this.urlApi = sharedService.host+'/api/employee/contracts';
  }

  /***** getActiveContracts: Carga los contratos activos del usuario */
  getActiveContracts(): Observable<string> {
    this.sharedService.showLoading("Cargando contratos...");
    return this.http
      .get<string>(this.urlApi + '/active')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Muestra el mensaje de error
          this.sharedService.showToast(error.error.error,'danger',1000);
          return throwError(error);
        })
      );
  }

  /***** getContracts: Carga todos los contratos del usuario */
  getContracts(): Observable<string> {
    return this.http
      .get<string>(this.urlApi)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Muestra el mensaje de error
          this.sharedService.showToast(error.error.error,'danger',1000);
          return throwError(error);
        })
      );
  }

  /***** getContract: Carga el contrato especificado con los registros entre fechas */
  getContract(contractId: string, startDate?: string, endDate?: string,recordsPerPage?: number,page?: number): Observable<string> {
    let url = this.urlApi + '/' + contractId;

    // Monta la url de petición con los datos
    if (startDate) {    // Añadir startDate si existe
      url += '/' + startDate;
      if (endDate) {  // Añadir endDate si existe
        url += '/' + endDate;
        if (recordsPerPage) { // Añadir recordsPerPage si existe
          url += '/' + recordsPerPage;
          if (page) {  // Añadir page si existe
            url += '/' + page;
          }
        }
      }
    }
  
    // Realizar la solicitud
    return this.http
      .get<string>(url)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Muestra el mensaje de error
          this.sharedService.showToast(error.error.error,'danger',1000);
          return throwError(error);
        })
      );
  }
}
