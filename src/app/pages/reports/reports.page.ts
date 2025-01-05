import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { EmployeeService } from 'src/app/services/employee.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  // Contiene los contratos del usuario
  contracts: any[] = [];
  // Contiene los datos del contrato
  contract: any;
  // Contiene los registros del contrato
  selectedContractReports: number | null = null;
  // El contrato seleccionado
  selectedContract: any;
  // Los registros del contrato
  records: any[] = [];
  // Estas son las fechas para el filtrado
  startDate: string = new Date().toISOString();
  endDate: string = new Date().toISOString();
  // Controla el disabled del botón buscar, sólo se activa si las fechas son válidas
  searched = false;
  // Contiene las coordenadas del registro
  latitude: string = '';
  longitude: string = '';
  // Para parametizar los resultados
  recordsPerPage: number = 10;
  // Gestiona los resultados paginados
  page: number = 1;
  // Controla si es la última página para no seguir haciendo solicitudes
  lastPage: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  // Limpia los registros anteriores y carga todos los contratos del usuario
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.contracts = [];
      this.employeeService.getContracts().subscribe(
        (res: any) => {
          this.contracts=res.data;
        },
        (error: HttpErrorResponse) => {
          this.sharedService.errorLog(error.error);
        }
      );
    });
  }
  /***** openLocation: Abre la vista de Geolocalización con las coordenadas recibidas */
  openLocation(latitude?: string, longitude?: string) {
    // Si existen coordenadas carga el mapa
    if (latitude && longitude && latitude != '' && longitude != ''){
      this.latitude = latitude;
      this.longitude = longitude;
      this.router.navigate(['/map'], {
        queryParams: {
          latitude: this.latitude,
          longitude: this.longitude,
        },
      });
    }else{
      this.sharedService.showToast('Coordenadas GPS no válidas','danger',1000);
    }
  }

  /***** updateContract: Actualiza el contrato seleccionado */
  updateContract() {
    this.selectedContract = this.contracts.find((contract) => contract.id === this.selectedContractReports);
    if (!this.selectedContract) {
      this.sharedService.showToast('No se encontró el contrato seleccionado.','danger');
    }
  }

  /***** onIonInfinite: Este método es llamado cada vez que llega al final de los últimos registros cargados */
  onIonInfinite(ev: any) {
    // Si quedan aún registros por mostrar
    if (!this.lastPage) {
      this.employeeService.getContract(this.selectedContract.id,this.startDate,this.endDate,this.recordsPerPage,this.page++).subscribe(
        (res: any) => {
          if (res.data.records.length > 0){
            this.records.push(...res.data.records);
          } else {
            this.lastPage = true;
            this.sharedService.showToast('No quedan más registros por mostrar','warning',1000);
          }
        },
        (error: HttpErrorResponse) => {
          this.sharedService.errorLog(error.error);
        }
      );
      // Se establece un tiempo de 500 ms de espera para no colapsar el servicio
      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    }else{
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }

  /***** searchRecords: Busca los registros en base a los parámetros seleccionados */
  searchRecords() {
    // Al realizar una nueva búsqueda las páginas se renuevan y empieza en la primera página
    this.lastPage = false;
    this.page = 1;
    // Se comprueban las fechas y se lanza una llamada al api en caso de ser correctas
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
    if (end < start) {
      this.sharedService.showToast("La fecha de fin no puede ser inferior a la de inicio","danger");
    } else {
      this.sharedService.showLoading("Buscando...");
      // Recoge los registros asociados al contrato seleccionado paginados
      this.employeeService.getContract(this.selectedContract.id,this.startDate,this.endDate,this.recordsPerPage,this.page++).subscribe(
        (res: any) => {
          this.contract = res.data;
          this.records = this.contract.records;
          this.sharedService.hideLoading();
        },
        (error: HttpErrorResponse) => {
          this.sharedService.hideLoading();
        }
      );
    }
  }
}
