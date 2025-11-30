import { supabase, isSupabaseEnabled, currentEnv } from './supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export class AuthService {
  static async signUp(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        user: null,
        session: null,
        error: {
          message: 'Supabase is not enabled',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            environment: currentEnv,
          },
        },
      });

      return {
        user: data.user,
        session: data.session,
        error: error,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        user: null,
        session: null,
        error: {
          message: 'Supabase is not enabled',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error: error,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  static async signOut(): Promise<{ error: AuthError | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        error: {
          message: 'Supabase is not enabled',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseEnabled || !supabase) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async getCurrentSession(): Promise<Session | null> {
    if (!isSupabaseEnabled || !supabase) {
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return {
        error: {
          message: 'Supabase is not enabled',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  }

  static onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    if (!isSupabaseEnabled || !supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('supabase.auth.token');
  }
}
