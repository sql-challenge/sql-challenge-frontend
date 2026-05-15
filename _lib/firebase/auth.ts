import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export async function signInWithGoogle(): Promise<{ idToken: string; displayName: string; photoURL: string }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, displayName: credential.user.displayName ?? "", photoURL: credential.user.photoURL ?? "" };
}

export async function signInWithGithub(): Promise<{ idToken: string; displayName: string; photoURL: string }> {
  const credential = await signInWithPopup(auth, githubProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, displayName: credential.user.displayName ?? "", photoURL: credential.user.photoURL ?? "" };
}

export async function signInWithEmailPassword(email: string, password: string): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

export async function createUserWithEmailPassword(email: string, password: string): Promise<{ idToken: string }> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { idToken };
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export function onFirebaseAuthStateChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
