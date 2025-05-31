
"use client";

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, googleProvider } from '@/lib/firebase/config'; // Import googleProvider
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, // Import signInWithPopup
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import type { SignUpFormData, LoginFormData } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: AuthError | null;
  signUpWithEmail: (data: SignUpFormData) => Promise<void>;
  signInWithEmail: (data: LoginFormData) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Add signInWithGoogle
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      console.error("Full sign-up error:", err);
      setError(err as AuthError);
      throw err; // Re-throw to be caught by form handler
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      setError(err as AuthError);
      throw err; // Re-throw to be caught by form handler
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      console.error("Full Google Sign-In error:", err); // Added detailed logging
      setError(err as AuthError);
      throw err; // Re-throw to be caught by form handler
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle, // Provide signInWithGoogle
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

