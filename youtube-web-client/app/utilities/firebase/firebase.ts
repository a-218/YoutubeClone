// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFunctions} from "firebase/functions";
import {
     getAuth,
     signInWithPopup,
      GoogleAuthProvider,
      onAuthStateChanged, 
      User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdRrd17_v1WVad4U5FEL90ELe9buiCtrU",
  authDomain: "alex-clone-89b33.firebaseapp.com",
  projectId: "alex-clone-89b33",
  appId: "1:361478569592:web:36edc29952faf4dca9378d",
  measurementId: "G-XX4NF4R47T"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const functions = getFunctions();

export function signInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut(){
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user:User | null) => void){
    return onAuthStateChanged(auth, callback);
}
