// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

/*const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: "solana-car-auction.firebaseapp.com",
    projectId: "solana-car-auction",
    storageBucket: "solana-car-auction.appspot.com",
    messagingSenderId: "504562140077",
    appId: "1:504562140077:web:faf59e5580f7bba9a15724"
};
*/
const firebaseConfig = {
    apiKey: "AIzaSyD5KA56MEKKy91pfTQ8Bifma2_6lNli_os",
    authDomain: "carmarketsolana.firebaseapp.com",
    projectId: "carmarketsolana",
    storageBucket: "carmarketsolana.appspot.com",
    messagingSenderId: "556997555451",
    appId: "1:556997555451:web:cfd4a9bd2cfbc64d38ac5e",
    measurementId: "G-V934JTRDP9"
  };
// Initialize Firebase
const initializeFirebase = () => initializeApp(firebaseConfig)

export default initializeFirebase