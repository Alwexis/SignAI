// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdTLAyumUyrJC1OfawXPwyh_Ene1NS3vw",
  authDomain: "signai-dac22.firebaseapp.com",
  projectId: "signai-dac22",
  storageBucket: "signai-dac22.appspot.com",
  messagingSenderId: "362251577154",
  appId: "1:362251577154:web:cdca2ecc8adb2b22e24adb",
  measurementId: "G-WQ0TS0CL8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const projectAuth = getAuth(app)