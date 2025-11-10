// firebaseConfig.ts

// NOTA: Estas credenciales deben ser reemplazadas por las de tu propio proyecto de Firebase.
// Se recomienda encarecidamente utilizar variables de entorno para almacenar esta información sensible.
// Por ejemplo, process.env.REACT_APP_FIREBASE_API_KEY

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
};
