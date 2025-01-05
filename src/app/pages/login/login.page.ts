import { Component, OnInit } from '@angular/core';

import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { AuthDTO } from 'src/app/models/auth.dto';
import { AuthService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  // Contiene el usuario autenticado
  loginUser: AuthDTO;

  // Datos del formulario
  email: UntypedFormControl;
  password: UntypedFormControl;
  loginForm: UntypedFormGroup;
  // Inicialmente no está marcado el recordar
  rememberMe: boolean = false;
  debugMessage: string | null = null;

  // Inicializa los datos con las validaciones y restricciones
  constructor(private formBuilder: UntypedFormBuilder,
              private authService: AuthService,
              private router: Router,
              private sharedService: SharedService
  ) {

    this.loginUser = new AuthDTO('','','');

    this.email = new UntypedFormControl('', [
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
    ]);

    this.password = new UntypedFormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]);

    this.loginForm = this.formBuilder.group({
      email: this.email,
      password: this.password,
    });
    
  }

  /***** Si existe un usuario almacenado y estaba activado el remember, reestablece los datos*/
  ngOnInit() {
    const user = localStorage.getItem('user');
    if (localStorage.getItem('remember') == 'true' && user){
      this.rememberMe = true;
      this.email.setValue(JSON.parse(user).email);
      this.password.setValue(JSON.parse(user).password);
    }
  }

  /***** login: autentica al usuario y almacena su token */
  login(): void {
    this.loginUser.email = this.email.value;
    this.loginUser.password = this.password.value;

    this.authService.login(this.loginUser).subscribe(
        (resp: AuthDTO) => {
          this.sharedService.showToast('Bienvenido/a '+this.loginUser.email,'success');
          // Actualiza los datos del usuario
          this.loginUser = resp;
          this.loginUser.password = this.password.value;
          // Guarda el usuario si se activa el remember y en caso contrario sólo el token
          if (this.rememberMe){
            localStorage.setItem('user', JSON.stringify(this.loginUser));
          } else {
            localStorage.setItem('user', JSON.stringify(new AuthDTO(this.loginUser.token,'','')));
          }
          localStorage.setItem('remember',''+this.rememberMe);
          this.email.setValue('');
          this.password.setValue('');
          // Carga la vista para fichar
          this.router.navigate(['fichar'], { queryParams: { reload: true }});
        }
      );
  }
}
