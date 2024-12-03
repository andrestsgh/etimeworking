import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthDTO } from 'src/app/models/auth.dto';
import { AuthService, AuthToken } from 'src/app/services/auth.service';
//import { HeaderMenus } from 'src/app/Models/header-menus.dto';
//import { HeaderMenusService } from 'src/app/services/header-menus.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginUser: AuthDTO;
  email: UntypedFormControl;
  password: UntypedFormControl;
  loginForm: UntypedFormGroup;
  rememberMe: boolean = false;

  constructor(private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    //private headerMenusService: HeaderMenusService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.loginUser = new AuthDTO('', '', '', '');

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

  ngOnInit() {}

  login(): void {
    let responseOK: boolean = false;
    let errorResponse: any;

    this.loginUser.email = this.email.value;
    this.loginUser.password = this.password.value;

    this.authService
      .login(this.loginUser)
      .pipe(
        finalize(async () => {
          /*await this.sharedService.managementToast(
            'loginFeedback',
            responseOK,
            errorResponse
          );*/

          if (responseOK) {
            /*const headerInfo: HeaderMenus = {
              showAuthSection: true,
              showNoAuthSection: false,
            };
            this.headerMenusService.headerManagement.next(headerInfo);*/
            this.router.navigate(['fichar']);          
          }
        })
      )
      .subscribe(
        (resp: AuthToken) => {
          responseOK = true;
          this.loginUser.user_id = resp.user_id;
          this.loginUser.access_token = resp.access_token;

          this.localStorageService.set('user_id', this.loginUser.user_id);
          this.localStorageService.set(
            'access_token',
            this.loginUser.access_token
          );
        },
        (error: HttpErrorResponse) => {
          responseOK = false;
          errorResponse = error.error;
          console.log(errorResponse);
          /*const headerInfo: HeaderMenus = {
            showAuthSection: false,
            showNoAuthSection: true,
          };
          this.headerMenusService.headerManagement.next(headerInfo);*/

          this.sharedService.errorLog(error.error);
        }
      );
  }
}
