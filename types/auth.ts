// types/auth.ts - Updated for NestJS Backend

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// ✅ NestJS AuthService.login() returns this structure
export interface AuthResponse {
  user: User;
  token: string;           // access_token from NestJS
  refreshToken?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// ✅ Token verification response
export interface TokenVerifyResponse {
  valid: boolean;
}

// ✅ Password change
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}