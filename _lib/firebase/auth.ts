import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onIdTokenChanged,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Hard gate de verificação de email — só em produção (fora de emuladores).
 * Em dev o fluxo continua sem fricção: cria conta e entra direto.
 */
export const REQUIRE_EMAIL_VERIFICATION =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== "true";

export async function signInWithGoogle(): Promise<{ idToken: string; displayName: string; photoURL: string; credential: UserCredential }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, displayName: credential.user.displayName ?? "", photoURL: credential.user.photoURL ?? "", credential };
}

export async function signInWithGithub(): Promise<{ idToken: string; displayName: string; photoURL: string; credential: UserCredential }> {
  const credential = await signInWithPopup(auth, githubProvider);
  const idToken = await credential.user.getIdToken();
  return { idToken, displayName: credential.user.displayName ?? "", photoURL: credential.user.photoURL ?? "", credential };
}

export async function signInWithEmailPassword(email: string, password: string): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

export async function createUserWithEmailPassword(email: string, password: string): Promise<{ idToken: string; credential: UserCredential }> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { idToken, credential };
}

/** Envia (ou reenvia) o email de verificação para o usuário logado. */
export async function sendVerificationEmail(): Promise<void> {
  const current = auth.currentUser;
  if (!current) throw new Error("Usuário não autenticado.");
  await sendEmailVerification(current);
}

/**
 * Re-checa o status de verificação: recarrega o registro do usuário
 * e força um novo ID token com os claims atualizados.
 */
export async function reloadAndCheckVerified(): Promise<boolean> {
  const current = auth.currentUser;
  if (!current) return false;
  await current.reload();
  await current.getIdToken(true);
  return current.emailVerified;
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/**
 * onIdTokenChanged (e não onAuthStateChanged): dispara também na rotação
 * automática de token do Firebase (~1h). Sem isso, o token guardado no
 * api client expira durante sessões longas e todas as chamadas passam a
 * dar 401 → logout forçado no meio de um capítulo.
 */
export function onFirebaseIdTokenChanged(callback: (user: User | null) => void): () => void {
  return onIdTokenChanged(auth, callback);
}
