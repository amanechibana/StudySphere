import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth } from "./firebaseSetup";

async function firebaseCreateUserWithEmailAndPassword(
  email: string,
  password: string,
) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

async function firebaseChangePassword(
  email: string,
  oldPassword: string,
  newPassword: string,
) {
  const user = auth.currentUser;

  if (!user) throw new Error("No user logged in");
  const credential = EmailAuthProvider.credential(email, oldPassword);

  await reauthenticateWithCredential(user, credential);

  await updatePassword(user, newPassword);
  await firebaseSignOut();
}

async function firebaseSignInWithEmailAndPassword(
  email: string,
  password: string,
) {
  await signInWithEmailAndPassword(auth, email, password);
}

async function firebaseGoogleSignIn() {
  const googleProvider = new GoogleAuthProvider();
  await signInWithPopup(auth, googleProvider);
}

async function firebasePasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}


async function firebaseSignOut() {
  await signOut(auth);
}

export {
    firebaseCreateUserWithEmailAndPassword,
    firebaseChangePassword,
    firebaseSignInWithEmailAndPassword,
    firebaseGoogleSignIn,
    firebasePasswordReset,
    firebaseSignOut
}