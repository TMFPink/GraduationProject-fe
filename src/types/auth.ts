export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  metadata: {
    accessToken: string;
  };
}

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role_id: string;
}
