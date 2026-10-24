import { apiPost } from './client';

export type LoginRequest = {
  userName: string;
  password: string;
  rememberMe: boolean;
};

export function login(body: LoginRequest) {
  return apiPost<void, LoginRequest>('/api/auth/login', body);
}

export function logout() {
  return apiPost<void>('/api/auth/logout');
}
