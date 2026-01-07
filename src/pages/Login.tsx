// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonSpinner,
} from "@ionic/react";

import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
 import { useLocation } from "react-router-dom";

// Inside Login component

// Allowed email addresses
const allowedEmails = [
  "livingsambank@gmail.com",
  "oyebadepriscilla22@gmail.com",
];

const Login: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  // Inside Login component
const location = useLocation();
useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("verified") === "true") {
    setInfo("Email verified! Please log in to continue.");
  }
}, [location.search]);
  // --- Login handler ---
  const handleLogin = async () => {
    setError("");
    setInfo("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      if (!user) throw new Error("Authentication failed.");

      // Email whitelist
      if (!allowedEmails.includes(user.email!)) {
        await auth.signOut();
        throw new Error("Your email is not authorized to access this app.");
      }

      // Email verification
      if (!user.emailVerified) {
        await auth.signOut();
        throw new Error("Please verify your email before logging in.");
      }

      // 🔑 ENSURE USER EXISTS IN FIRESTORE
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          fullName: user.displayName ?? "User",
          email: user.email,
          matricNumber: "",
          lecturesProgress: 0,
          assignmentsCompleted: 0,
          totalAssignments: 5,
          createdAt: new Date(),
        });
      }

      // ✅ Redirect AFTER Firestore is ready
      history.replace("/home");

    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
  history.push("/register");
};


  // --- Reset Password ---
  const handleResetPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
       <IonCard>
  <IonCardContent>

    <IonItem>
      <IonLabel position="floating">Email</IonLabel>
      <IonInput
        type="email"
        value={email}
        onIonChange={e => setEmail(e.detail.value!)}
      />
    </IonItem>

    <IonItem className="ion-margin-top">
      <IonLabel position="floating">Password</IonLabel>
      <IonInput
        type="password"
        value={password}
        onIonChange={e => setPassword(e.detail.value!)}
      />
    </IonItem>

    {error && (
      <IonText color="danger">
        <p className="ion-padding-top">{error}</p>
      </IonText>
    )}

    {info && (
      <IonText color="success">
        <p className="ion-padding-top">{info}</p>
      </IonText>
    )}

    <IonButton
      expand="block"
      className="ion-margin-top"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? <IonSpinner name="crescent" /> : "Login"}
    </IonButton>

    <IonButton
      fill="clear"
      expand="block"
      onClick={handleResetPassword}
    >
      Forgot Password?
    </IonButton>

    <IonButton
      fill="clear"
      expand="block"
      color="secondary"
      onClick={handleSignUp}
    >
      Don’t have an account? Sign Up
    </IonButton>

  </IonCardContent>
</IonCard>

      </IonContent>
    </IonPage>
  );
};

export default Login;
