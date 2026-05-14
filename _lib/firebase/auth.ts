import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type UserCredential,
  type User,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export async function signInWithGoogle(): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

export async function signInWithGithub(): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithPopup(auth, githubProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

export async function signInWithEmailPassword(email: string, password: string): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export function onFirebaseAuthStateChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
