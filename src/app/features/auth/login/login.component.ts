import { CommonModule } from '@angular/common';

import {
  AfterViewInit,
  Component,
  inject
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { Store } from '@ngrx/store';

import { AuthActions } from '../../../store/auth/auth.actions';

import {
  selectAuthError,
  selectAuthLoading
} from '../../../store/auth/auth.selectors';

import { environment } from '../../../../environments/environment';

declare const google: any;

import { AuthSideComponent } from '../../../shared/components/auth-side/auth-side.component';

@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, AuthSideComponent],

  templateUrl: './login.component.html'

})
export class LoginComponent implements AfterViewInit {

  private fb = inject(FormBuilder);

  private store = inject(Store);

  showPassword = false;

  loading$ = this.store.select(selectAuthLoading);

  error$ = this.store.select(selectAuthError);


  form = this.fb.nonNullable.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ],
rememberMe: [false]
  });


  ngAfterViewInit(): void {

    this.loadGoogleLogin();

  }


  private loadGoogleLogin(): void {

    const scriptId = 'google-client-script';

    // لو الـ script موجود بالفعل
    if (document.getElementById(scriptId)) {

      this.initializeGoogle();

      return;

    }


    const script = document.createElement('script');

    script.id = scriptId;

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;

    script.defer = true;


    script.onload = () => {

      this.initializeGoogle();

    };


    document.head.appendChild(script);

  }


  private initializeGoogle(): void {

    if (typeof google === 'undefined') {

      console.error(
        'Google Identity Services is not loaded'
      );

      return;

    }


    google.accounts.id.initialize({

      client_id:
        environment.googleClientId,

      callback:
        (response: any) => {

          this.handleGoogleLogin(
            response.credential
          );

        }

    });


    const googleButton =
      document.getElementById('google-button');


    if (googleButton) {

      google.accounts.id.renderButton(

        googleButton,

        {
          theme: 'outline',
          size: 'large',
          width: this.googleButtonWidth(googleButton),
          text: 'continue_with'
        }

      );

    }

  }


  // Google only accepts 200-400px — fit the card width so it never overflows a small phone
  private googleButtonWidth(el: HTMLElement): number {
    const available = el.parentElement?.clientWidth || 350;
    return Math.max(200, Math.min(350, Math.floor(available)));
  }

  private handleGoogleLogin(
    idToken: string
  ): void {

    if (!idToken) {

      console.error(
        'Google ID Token is missing'
      );

      return;

    }


    this.store.dispatch(

      AuthActions.googleLogin({
        idToken
      })

    );

  }


  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }


    this.store.dispatch(

      AuthActions.login({
        payload: this.form.getRawValue()
      })

    );

  }

}