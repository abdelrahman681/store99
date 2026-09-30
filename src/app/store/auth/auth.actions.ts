import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginDTO, RegisterPayload, UserDTO } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {

    'Login': props<{ payload: LoginDTO }>(),
    'Login Success': props<{ user: UserDTO }>(),
    'Login Failure': props<{ error: string }>(),

    'Google Login': props<{ idToken: string }>(),
    'Google Login Success': props<{ user: UserDTO }>(),
    'Google Login Failure': props<{ error: string }>(),

    'Register': props<{ payload: RegisterPayload }>(),
    'Register Success': props<{ user: UserDTO }>(),
    'Register Failure': props<{ error: string }>(),

    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: UserDTO }>(),
    'Load Current User Failure': emptyProps(),

    'Logout': emptyProps(),
    'Logout Success': emptyProps(),
  }
});