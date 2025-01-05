import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartType } from 'angular-google-charts';
import { EmployeeService } from 'src/app/services/employee.service';
import { SharedService } from 'src/app/services/shared.service';
import { Geolocation } from '@capacitor/geolocation';
import { finalize, from } from 'rxjs';

export interface SignInData {
  contract_id: any,
  finished: boolean,
  latitude: string, 
  longitude: string 
};

@Component({
  selector: 'app-fichar',
  templateUrl: './fichar.page.html',
  styleUrls: ['./fichar.page.scss'],
})

export class FicharPage implements OnInit {
  // Datos iniciales para el botón de fichar
  signInButton = { text: 'Comenzar jornada', color: 'success' };
  // Fecha y hora del último fichaje
  lastTime: string | null = null;
  // Contiene el contrato seleccionado en el desplegable
  selectedContractFichar: number | null = null;
  // Contiene el contrato fichado. Se usa para evitar que se pueda fichar en dos contratos al mismo tiempo.
  selectedContract: any;
  // Permite cambiar el estado del botón fichar
  isWorking: boolean = false;
  // Contiene los contratos del usuario
  contracts: any[] = [];

  // Configuración del gráfico inicial
  chartData = {
    chartType: ChartType.PieChart,
    dataTable: [
      ['Trabajado', 0],
      ['Restante', 0],
      ['Extra', 0]
    ],
    options: {
      titleTextStyle: {
        fontSize: 20,
        bold: true,
        color: '#007BFF',
      },
      is3D: false,
      pieHole: 0.4,
      height: '100%',
      responsive: true,
      legend: { position: 'bottom' },
    }
  };
  chartTitle: string = 'Selecciona un contrato';
  dynamicResize: boolean = true; // Permite que el gráfico se ajuste a la ventana

  constructor(
    private employeeService: EmployeeService,
    private sharedService: SharedService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {   }

  ngOnInit(): void {
    // Al iniciar la vista carga los contratos del usuario en el listado
    this.route.queryParams.subscribe(params => {
      this.contracts = [];
      this.employeeService.getActiveContracts().subscribe(
        (res: any) => {
          // Carga los contratos
          this.contracts=res.data;
          // Limpia el gráfico en caso de haber algún dato anterior cargado
          this.chartTitle = 'Selecciona un contrato';
          this.chartData.dataTable =[
            ['Trabajado', 0],
            ['Restante', 0],
            ['Extra', 0],            
          ];
          // En sharedService se almacenan estados y valores compartidos por las vistas
          // entre ellos el contrato seleccionado en la vista fichar, para que al cambiar
          // de vista y volver cargue el último contrato seleccionado.
          this.selectedContractFichar = this.sharedService.selectedOptionContract;
          // Lo carga sólo si existe.
          if (this.selectedContractFichar){
            this.updateContract();
          }
          // oculta el spinner
          this.sharedService.hideLoading();
        },
        (error: HttpErrorResponse) => {
          // Muestra el mensaje de error durante un segundo
          this.sharedService.showToast('id.ats ERROR'+JSON.stringify(error),'warning',1000);
          //this.sharedService.errorLog(error.error);
          // oculta el spinner
          this.sharedService.hideLoading();
        }
      );
    });
  }

  /***** updateContract: Actualiza la vista con los datos del contrato seleccionado */
  updateContract() {
    // Busca el contrato seleccionado en el arreglo de contratos
    this.selectedContract = this.contracts.find((contract) => contract.id === this.selectedContractFichar);
    // Si el contrato existe actualiza la vista con los datos, en caso contrario devuelve un mensaje
    if (this.selectedContract) {
      // Guarda el estado del contrato como último contrato seleccionado
      this.sharedService.selectedOptionContract = this.selectedContractFichar;
      const begin = this.datePipe.transform(new Date(this.selectedContract.startRecords), 'dd/MM/yy');
      const end = this.datePipe.transform(new Date(this.selectedContract.endRecords), 'dd/MM/yy');
      this.chartTitle = `Jornada de ${this.selectedContract.hours} horas\n${begin} al ${end}`;
      // Llama a actualizar la interfaz
      this.updateUI(this.selectedContract);
    } else {
      this.sharedService.showToast('No se encontró el contrato seleccionado.','danger');
    }
  }

  /***** updateUI: Actualiza el estado del botón y el gráfico */
  updateUI(selectedContract: any): void {
    // Si hay un último registro actualiza el estado del botón y datos según el último registro
    if (selectedContract.record){
      if (selectedContract.record.finished) {
        this.signInButton.text = 'Comenzar jornada';
        this.signInButton.color = 'success';
      } else {
        this.signInButton.text = 'Finalizar jornada';
        this.signInButton.color = 'danger';
      }
      this.lastTime = selectedContract.record.sign_time;
    }else{    // Si no existe último registro es un contrato nuevo
      this.signInButton.text = 'Comenzar jornada';
      this.signInButton.color = 'success';
      this.lastTime = '';
    }
    this.updateChart(selectedContract);
  }

  /***** updateChart: Actualiza el gráfico con los datos del contrato */
  updateChart(contract: any): void{
    const workedHours = contract.hours_worked;
    const remainingHours = contract.hours - workedHours;
    // Si las horas pendientes son positivas es que aún quedan horas por cumplir
    if (remainingHours >= 0){
      this.chartData.dataTable =[
        ['Trabajado', workedHours],
        ['Restante', remainingHours],
        ['Extra', 0],
      ];
    } else {   // En caso contrario computan como horas extra
      this.chartData.dataTable =[
        ['Trabajado', workedHours+remainingHours],
        ['Restante', 0],
        ['Extra', Math.abs(remainingHours)],
      ];
    }
  }

  /***** signInWork: Recoge las coordenadas GPS y llama al método signIn para fichar */
  signInWork(): void {
    // Comprueba que no fichemos en dos contratos al mismo tiempo
    if (this.selectedContract.record && this.selectedContract.record.finished && this.isWorking){
      this.sharedService.showToast('Finaliza la sesión de trabajo actual antes de comenzar una nueva.','danger');
      return;
    }

    // Datos para subir al servidor
    let payload: SignInData = {
      contract_id: this.selectedContractFichar,
      finished: false,
      latitude: '', 
      longitude: '' 
    };

    // Si el usuario tiene en sus preferencias la geolocalización
    if (this.sharedService.sharedPreferences.geolocation) {
      // Recoge las coordenadas GPS. En el navegador debemos aceptar los permisos, y en el dispositivo móvil,
      // por ejemplo Android deben declararse en el AndroidManifest.xml
      const getCurrentPositionObservable = () => {
        // Muestra el mensaje de carga
        this.sharedService.showLoading('Fichando...');
        return from(Geolocation.getCurrentPosition());
      };
      let coords: {latitude: string | null, longitude: string | null};
      // Gestiona la petición de coordenadas
      getCurrentPositionObservable()
      .pipe(
        finalize(() => {
          // Actualiza las coordenadas
          payload.latitude = ''+coords.latitude;
          payload.longitude = ''+coords.longitude;
          // Envía la petición para fichar
          this.signIn(payload);
        })
      )
      .subscribe({  // Gestiona la obtención de las coordenadas
        next: (position) => {
          coords = {latitude: ''+position.coords.latitude, longitude: ''+position.coords.longitude};
          console.log(`Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`);
        },
        error: (err) => {
          coords = {latitude: '', longitude: ''};
          this.sharedService.showToast('Error obteniendo coordenadas. '+err.message,'danger');
        },
      });
    }else{
      this.sharedService.showLoading('Fichando...');
      // Envía la petición para fichar sin coordenadas
      this.signIn(payload);
    }
  }

  /***** signIn: Envío de datos a la API */
  signIn(payload: SignInData){
    // Cambia el estado del botón después de fichar, sincronizada con la respuesta del servidor
    this.isWorking = !(this.selectedContract.record ? !this.selectedContract.record.finished : false);
    payload.finished = !this.isWorking;
    this.http.post(this.sharedService.host+'/api/employee/records', payload).subscribe({
      next: (response: any) => {
        if (response.success){
          // Actualiza el contrato con el último registro actualizado
          // esto sólo se hace si el servidor nos devuelve el registro confirmado.
          this.selectedContract.record = response.data;
          // Se solicita al servidor de nuevo el contrato con las horas totales calculadas
          // para actualizar el gráfico
          this.employeeService.getContract(this.selectedContract.id).subscribe(
            (res: any) => {
              const updatedContract = res.data;
              const contractIndex = this.contracts.findIndex((contract) => contract.id === updatedContract.id);
              
              // Si se encuentra el contrato, lo sustituye y actualiza la vista
              if (contractIndex !== -1) {
                this.contracts[contractIndex] = updatedContract;
                this.updateUI(this.contracts[contractIndex]);
              } else {
                this.sharedService.showToast('Contrato no enconrado.','danger');
              }
              this.sharedService.hideLoading();
            },
            (error: HttpErrorResponse) => {
              this.sharedService.showToast('Error: HttpErrorResponse.','danger');
              this.sharedService.errorLog(error.error);
              this.sharedService.hideLoading();
            }
          );
        }
      },
      error: (error) => {
        this.sharedService.showToast('Error al enviar los datos: '+ error.message,'danger');
      }
    });
  }
}
