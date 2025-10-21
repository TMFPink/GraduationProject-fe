export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  role_id: string;
}
