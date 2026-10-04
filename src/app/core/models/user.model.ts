export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export interface UserDTO {
  email: string;
  displayName: string;
  age: number;
  token: string;
  refreshToken: string;
  pictureUrl: string;
  gender: string;
  roleName?: string;
  id:string;
}

export interface RegisterPayload {
  Email: string;
  PhoneNumber: string;
  DisplayName: string;
  Password: string;
  DOB?: string;
  Gender?: Gender;
  Photo?: File;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?:boolean; 
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
  newPassword: string;
}
export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface GoogleLoginDTO {
  idToken: string;
}
export interface RefreshTokenResponse {
  token: string;
}