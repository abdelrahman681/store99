import { createReducer, on } from '@ngrx/store';
import { UserDTO } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
}

export const authFeatureKey = 'auth';

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

on(
  AuthActions.login,
  AuthActions.googleLogin,
  AuthActions.register,
  state => ({
    ...state,
    loading: true,
    error: null
  })
),
on(
  AuthActions.loginSuccess,
  AuthActions.googleLoginSuccess,
  AuthActions.registerSuccess,
  AuthActions.loadCurrentUserSuccess,
  (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })
),

  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.googleLoginFailure, (state, { error }) => ({
    ...state, loading: false, error, user: null
  })),

  on(AuthActions.loadCurrentUserFailure, state => ({ ...state, user: null })),

  on(AuthActions.logoutSuccess, () => initialState),
);
