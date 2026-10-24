import { apiGet, apiPost } from './client';

export type LoginRequest = {
  userName: string;
  password: string;
  rememberMe: boolean;
};

export type AuthRole = {
  id: string;
  name: string;
};

export type InviteRequest = {
  userName: string;
  email: string;
  roles: string[];
};

export type RegisterRequest = {
  name: string;
  password: string;
};

export function login(body: LoginRequest) {
  return apiPost<void, LoginRequest>('/api/auth/login', body);
}

export function register(invitationId: string, body: RegisterRequest) {
  return apiPost<void, RegisterRequest>(`/api/auth/register/${invitationId}`, body);
}

export function logout() {
  return apiPost<void>('/api/auth/logout');
}

export function getRoles() {
  return apiGet<AuthRole[]>('/api/auth/roles');
}

export function invite(body: InviteRequest) {
  return apiPost<string, InviteRequest>('/api/auth/invite', body);
}
