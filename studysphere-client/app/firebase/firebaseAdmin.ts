import { credential } from "firebase-admin";
import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
    credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
}

const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();

export const firebaseAdmin = getAuth(adminApp);