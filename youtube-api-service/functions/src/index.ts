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
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// evernt driven function when firebase create a user and this funcon is called
initializeApp();

const firestore = new Firestore();
const storage = new Storage();

const videoCollectionId = "videos";
const rawVideoBucket = "ali-raw-videos";
// const processedVideoBucket = "ali-processed-video";


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

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
    // check if user is authenticated
    if ( !request.auth ) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated"
        );
    }

    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucket);

    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
    // get a v4 singed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now()+ 15*60*1000,
    });
    return {url, fileName};
});


export const getVideos = onCall({maxInstances: 1}, async () =>{
   const snapshot =
   await firestore.collection(videoCollectionId).limit(10).get();
   return snapshot.docs.map((doc) => doc.data());
});
