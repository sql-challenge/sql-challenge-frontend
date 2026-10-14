import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita inicializar múltiplas vezes (Next.js hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Em dev (NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true) o Auth aponta para o
// emulador local — nunca para o projeto de produção. Suba com `npm run
// emulators` no repositório backend. O guard global evita reconectar no HMR.
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  const globalScope = globalThis as { __FIREBASE_AUTH_EMULATOR_CONNECTED__?: boolean };
  if (!globalScope.__FIREBASE_AUTH_EMULATOR_CONNECTED__) {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    globalScope.__FIREBASE_AUTH_EMULATOR_CONNECTED__ = true;
  }
}

export { app, auth };
