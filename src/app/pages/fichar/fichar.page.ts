import { Component, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-fichar',
  templateUrl: './fichar.page.html',
  styleUrls: ['./fichar.page.scss'],
})
export class FicharPage implements OnInit {
  selectedOption: string = 'contrato1';

  // Configuración del gráfico inicial
  chartData = {
    chartType: ChartType.PieChart,
    dataTable: [
      ['Trabajado', 5.5],
      ['Restante', 2.5]
    ],
    options: {
      title: 'Contrato 1: Jornada de 8 horas',
      is3D: false,
      pieHole: 0.4
    }
  };
  
  lastTime: string | null = null;
  buttonText: string = 'Comenzar jornada';
  buttonColor: string = 'success'; // Color verde, CSS Ionic
  
  constructor() {}

  ngOnInit(): void {}

  updateChartData() {
    if (this.selectedOption === 'contrato1') {
      this.chartData.dataTable = [
        ['Trabajado', 5.5],
        ['Restante', 2.5]
      ];
      this.chartData.options.title = 'Contrato 1: Jornada de 8 horas';
    } else if (this.selectedOption === 'contrato2') {
      this.chartData.dataTable = [
        ['Trabajado', 1.0],
        ['Restante', 3.0]
      ];
      this.chartData.options.title = 'Contrato 2: Jornada de 4 horas';
    } else if (this.selectedOption === 'contrato3') {
      this.chartData.dataTable = [
        ['Trabajado', 0.5],
        ['Restante', 4.5]
      ];
      this.chartData.options.title = 'Contrato 3: Jornada de 5 horas';
    }
  }
  toggleJornada(): void {
    const now = new Date();
    const formattedDate = this.formatDate(now);
    const formattedTime = this.formatTime(now);

    // Actualiza la etiqueta con la última vez pulsada
    this.lastTime = `Última vez: ${formattedDate} ${formattedTime}`;

    // Alterna entre los estados del botón
    if (this.buttonText === 'Comenzar jornada') {
      this.buttonText = 'Finalizar jornada';
      this.buttonColor = 'danger'; // Color rojo, CSS Ionic
    } else {
      this.buttonText = 'Comenzar jornada';
      this.buttonColor = 'success';
    }
  }

  // Extrae y formatea la fecha en dd/MM/YYYY
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Extrae y formatea la hora en hh:mm:ss
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
