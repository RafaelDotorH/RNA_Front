
import { initializeApp, getApps, getApp } from "firebase/app"; // Importa las funciones necesarias de Firebase
import { getAuth } from "firebase/auth"; // Importa la función de autenticación de Firebase

const firebaseConfig = { // Configuración de Firebase, asegurándose de que las variables de entorno estén definidas
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app; // Verifica si ya hay una aplicación de Firebase inicializada
if (!getApps().length) { // Si no hay aplicaciones inicializadas, crea una nueva
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app); // Obtiene la instancia de autenticación de Firebase

export { app, auth }; // Exporta la aplicación y la instancia de autenticación para su uso en otros módulos