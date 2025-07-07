import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import type { User as AuthUser } from "@supabase/supabase-js";

interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string): Promise<AuthResult> => {
    try {
      setError(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (
    email: string,
    token: string
  ): Promise<AuthResult> => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(data.user);
      return { success: true, user: data.user ?? undefined };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    try {
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return session?.access_token ?? null;
    } catch (err) {
      console.error("Error getting access token:", err);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithOtp,
    verifyOtp,
    signOut,
    getAccessToken,
  };
}
