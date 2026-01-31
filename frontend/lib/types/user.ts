export type UserRole = 'ADMIN' | 'PORTAL';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  contactId?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
