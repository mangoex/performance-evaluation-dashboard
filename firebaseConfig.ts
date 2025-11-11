// firebaseConfig.ts
// Configuración de Firebase para Firestore
// CREDENCIALES DEL PROYECTO: Evaluaciones de desempeño

export const firebaseConfig = {
  apiKey: "AIzaSyDYeQwQZ0nmtAMycpXJU6OBJBz4KFNbZy8",
  authDomain: "evaluaciones-de-desempeno.firebaseapp.com",
  projectId: "evaluaciones-de-desempeno",
  storageBucket: "evaluaciones-de-desempeno.firebasestorage.app",
  messagingSenderId: "151784928287",
  appId: "1:151784928287:web:f6c98626d74902721f112a",
  databaseURL: "https://evaluaciones-de-desempeno.firebaseio.com"
};

// Validación de configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("⚠️  Firebase Config Error: Faltan credenciales importantes.");
}

export default firebaseConfig;
