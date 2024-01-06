/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// evernt driven function when firebase create a user and this funcon is called
initializeApp();

const firestore = new Firestore();

export const createUser = functions.auth.user().onCreate((user)=>{
    const userInfo = {
        uid: user.uid,
        email: user.email,
        photoUrl: user.photoURL,
    };
    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`logger.info('User create: ${JSON.stringify(userInfo)})`);
    return;
});
