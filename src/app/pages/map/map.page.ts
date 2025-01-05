import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoogleMap } from '@capacitor/google-maps';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit,AfterViewInit {
  coords : { latitude: string, longitude: string } = {latitude: '', longitude: ''};
  // Esta Api Key se debe generar desde el panel Google Cloud API
  apiKey: string = 'YOUR_API_KEY_HERE';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Recoge las coordenadas del registro pasadoas como parámetro
    this.route.queryParams.subscribe((params) => {
      this.coords.latitude = params['latitude'];
      this.coords.longitude = params['longitude'];
      //console.log('Coordenadas:', this.latitude, this.longitude);
    });
  }
  ngAfterViewInit(): void {
    this.createMap();
  }
  // Recoge el elemento map de la vista
  @ViewChild('map')
  mapRef: ElementRef<HTMLElement> | undefined;
  newMap: GoogleMap | undefined;

  async createMap() {
    // Si existe un elemento donde ubicar el mapa y las coordenadas se crea
    // centra el mapa en el punto de localización
    if (this.mapRef && this.coords.latitude && this.coords.longitude){ 
      this.newMap = await GoogleMap.create({
        id: 'map',
        element: this.mapRef.nativeElement,
        apiKey: this.apiKey,
        config: {
          center: {
            lat: parseFloat(this.coords.latitude),
            lng: parseFloat(this.coords.longitude),
          },
          zoom: 8,
        },
      });
      // Agrega un marcador en las coordenadas
      const markerId = await this.newMap.addMarker({
        coordinate: {
          lat: parseFloat(this.coords.latitude),
          lng: parseFloat(this.coords.longitude),
        }
      });
    }
  }
}
