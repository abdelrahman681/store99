import { CommonModule } from '@angular/common';

import {
  AfterViewInit,
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { Store } from '@ngrx/store';

import { AuthActions } from '../../../store/auth/auth.actions';

import {
  selectAuthError,
  selectAuthLoading
} from '../../../store/auth/auth.selectors';

import {
  Gender,
  RegisterPayload
} from '../../../core/models/user.model';

import { environment } from '../../../../environments/environment';

declare const google: any;

import { AuthSideComponent } from '../../../shared/components/auth-side/auth-side.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, AuthSideComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements AfterViewInit {

  Gender = Gender;

  private fb = inject(FormBuilder);

  private store = inject(Store);

  showPassword = false;

  loading$ = this.store.select(selectAuthLoading);

  error$ = this.store.select(selectAuthError);

  selectedPhoto: File | undefined;


  form = this.fb.nonNullable.group({

    displayName: [
      '',
      Validators.required
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    phoneNumber: [
      '',
    Validators.required,
    Validators.minLength(11),
    Validators.maxLength(11)
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
      ]
    ],

    DOB: [
      '',
      Validators.required
    ],

    Gender: [
      Gender.Male,
      Validators.required
    ]

  });


  // =========================
  // Google Login
  // =========================

  ngAfterViewInit(): void {

    this.loadGoogleLogin();

  }


  private loadGoogleLogin(): void {

    const scriptId = 'google-client-script';

    // لو Google Script موجود بالفعل
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
      document.getElementById('google-button-register');


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


  // =========================
  // Register
  // =========================

  onPhotoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedPhoto = file;

  }


  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }


    const value =
      this.form.getRawValue();


    const payload: RegisterPayload = {

      Email: value.email,

      PhoneNumber: value.phoneNumber,

      DisplayName: value.displayName,

      Password: value.password,

      DOB: value.DOB,

      Gender: value.Gender,

      Photo: this.selectedPhoto

    };


    this.store.dispatch(

      AuthActions.register({
        payload
      })

    );

  }

}