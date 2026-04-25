// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaoW2FGTB-POYyUH6UI5sUDdwzfDrLGek",
  authDomain: "voltansistema.firebaseapp.com",
  projectId: "voltansistema",
  storageBucket: "voltansistema.firebasestorage.app",
  messagingSenderId: "311544115117",
  appId: "1:311544115117:web:9553c4871395ccb8057b24",
  measurementId: "G-L1VX102MZ0"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
