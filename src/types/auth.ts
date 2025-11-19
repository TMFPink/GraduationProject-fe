export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface User {
  user_id: string;
  username: string;
  userTag: string;
  email: string;
  phone_number: string;
  role_id: string;
  is_active: any;
  avatar_url: any;
  cover_url: any;
}
