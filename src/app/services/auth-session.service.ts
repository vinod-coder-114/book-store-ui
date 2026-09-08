import { Injectable, signal } from '@angular/core';

export type UserRole = 'customer' | 'admin';

export type LoginResponse = {
  email: string;
  expiresIn: string;
  name: string;
  role: string;
  token: string;
  userId: string;
};

export type AuthSession = {
  email: string;
  expiresIn: string;
  name: string;
  role: UserRole;
  token: string;
  userId: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly storageKey = 'book_store_auth_session';
  readonly session = signal<AuthSession | null>(null);

  constructor() {
    this.session.set(this.readSessionFromStorage());
  }

  saveSession(response: LoginResponse): AuthSession {
    const session: AuthSession = {
      email: response.email,
      expiresIn: response.expiresIn,
      name: response.name,
      role: this.normalizeRole(response.role),
      token: response.token,
      userId: response.userId,
    };

    sessionStorage.setItem(this.storageKey, JSON.stringify(session));
    this.session.set(session);
    return session;
  }

  getSession(): AuthSession | null {
    return this.session();
  }

  clearSession(): void {
    sessionStorage.removeItem(this.storageKey);
    this.session.set(null);
  }

  private readSessionFromStorage(): AuthSession | null {
    const rawSession = sessionStorage.getItem(this.storageKey);
    if (!rawSession) {
      return null;
    }

    try {
      const parsedSession = JSON.parse(rawSession) as AuthSession;
      const expirationTime = new Date(parsedSession.expiresIn).getTime();
      if (!Number.isFinite(expirationTime) || expirationTime <= Date.now()) {
        this.clearSession();
        return null;
      }
      return parsedSession;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private normalizeRole(role: string): UserRole {
    return role?.toLowerCase() === 'admin' ? 'admin' : 'customer';
  }
}
