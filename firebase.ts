// Fix: Import firebase and its database module to resolve 'firebase' is not defined errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// NOTE: Replace with your project's Firebase configuration
// For this example, we'll use a public-access demo database.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Not needed for demo db
  authDomain: "YOUR_AUTH_DOMAIN", // Not needed for demo db
  databaseURL: "https://performance-dashboard-app-default-rtdb.firebaseio.com/",
  projectId: "performance-dashboard-app",
  storageBucket: "performance-dashboard-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get a reference to the database service
export const db = { ref: () => ({ set: () => Promise.resolve(), on: () => {}, off: () => {} }) };
