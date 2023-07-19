import { initializeApp } from "@firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "@firebase/auth";
import { getFirestore, writeBatch } from "@firebase/firestore";
// const firebaseConfig = {
//   apiKey: "AIzaSyCBMh2SQYoNsyguYR8Sghr5erGmIkJYstw",
//   authDomain: "birdtrader-32d24.firebaseapp.com",
//   projectId: "birdtrader-32d24",
//   storageBucket: "birdtrader-32d24.appspot.com",
//   messagingSenderId: "669921251379",
//   appId: "1:669921251379:web:7343add29a494a6fd35346",
//   measurementId: "G-Y1HZP1HHC8",
// };

const firebaseConfig = {
  apiKey: "AIzaSyBU6GAQsDhXeb20TMwqg0ynwK1dnNkDzPs",
  authDomain: "trade-chim.firebaseapp.com",
  projectId: "trade-chim",
  storageBucket: "trade-chim.appspot.com",
  messagingSenderId: "731159794416",
  appId: "1:731159794416:web:948976866c362278c6e835",
};

// Initialize Firebase

export const FirebaseApp = initializeApp(firebaseConfig);
export const FirebaseAuth = getAuth(FirebaseApp);
// FirebaseAuth.sin;
export const FirebaseStore = getFirestore(FirebaseApp);
// FirebaseStore.
// batch;
// FirebaseStore.writeBatch();
