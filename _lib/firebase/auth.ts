import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Abre o popup do Google, autentica via Firebase e retorna o ID token.
 * O Firebase (Google) é o responsável pela identidade do usuário.
 */
export async function signInWithGoogle(): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

/**
 * Abre o popup do GitHub, autentica via Firebase e retorna o ID token.
 */
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
