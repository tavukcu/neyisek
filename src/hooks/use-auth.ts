"use client";

import { useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/types";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: storeLogout } =
    useAuthStore();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          const newUser: Omit<User, "id"> = {
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            phoneNumber: firebaseUser.phoneNumber || null,
            photoURL: firebaseUser.photoURL || null,
            role: "customer",
            addresses: [],
            preferences: { language: "tr", darkMode: false, notifications: true },
            createdAt: serverTimestamp() as never,
            updatedAt: serverTimestamp() as never,
            lastLoginAt: serverTimestamp() as never,
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser({ id: firebaseUser.uid, ...newUser } as User);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    storeLogout();
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    await sendPasswordResetEmail(auth, email);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
  };
}
