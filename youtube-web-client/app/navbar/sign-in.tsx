'use client';
import { Fragment } from "react";
import styles from "./sign-in.module.css";
import { signInWithGoogle, signOut } from "../utilities/firebase/firebase";
import {User} from "firebase/auth"

interface SignInProps{
    user: User | null;
}

export default function SignIn({user}: SignInProps){
    return (
        ///avoid rednering an element - sp wrap it in a fragement
        <Fragment>
            {
                user ? 
                (
                <button className={styles.signin} onClick={signOut}>
                    Sign Out
                </button>
                )
                :
                (
                <button className={styles.signin} onClick={signInWithGoogle}>  
             
                    Sign in
            
                </button>

                )
            }
           

        </Fragment>
    )
}