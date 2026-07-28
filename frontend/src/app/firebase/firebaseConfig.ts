import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQD7L3nkbWyy44xyExFvJGdJlcFLMxiS8",
  authDomain: "smart-agriculture-adviso-76368.firebaseapp.com",
  projectId: "smart-agriculture-adviso-76368",
  storageBucket: "smart-agriculture-adviso-76368.firebasestorage.app",
  messagingSenderId: "863058121508",
  appId: "1:863058121508:web:1712aec100727867ad19b1",
  measurementId: "G-8YX685V6QT"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firebaseApp = app;