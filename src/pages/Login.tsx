// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
  IonToast,
} from "@ionic/react";

import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Allowed email addresses
const allowedEmails = ["livingsambank@gmail.com", "oyebadepriscilla22@gmail.com"];

const Login: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Show "Email verified" message if redirected from VerifyEmail
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

      // Email whitelist check
      if (!allowedEmails.includes(user.email!)) {
        await auth.signOut();
        throw new Error("Your email is not authorized to access this app.");
      }

      // Email verification check
      if (!user.emailVerified) {
        await auth.signOut();
        throw new Error("Please verify your email before logging in.");
      }

      // Ensure Firestore user exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          fullName: user.displayName ?? "User",
          email: user.email,
          matricNumber: "",
          lecturesProgress: 0,
          assignmentsCompleted: 0,
          totalAssignments: 20, // default total assignments
          createdAt: serverTimestamp(),
        });
      }

      // Redirect to Dashboard/Home
      history.replace("/home");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- Sign Up redirect ---
  const handleSignUp = () => {
    history.push("/register");
  };

  // --- Password reset ---
  const handleResetPassword = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setToast("Password reset email sent. Check your inbox.");
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
        <IonCard className="auth-card">
          <IonCardContent>

            <IonText className="auth-header">
              <h2>Welcome Back</h2>
              <p>Login to continue</p>
            </IonText>

            <IonItem className="form-item">
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={e => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
              />
            </IonItem>

            {error && <IonText color="danger"><p>{error}</p></IonText>}
            {info && <IonText color="success"><p>{info}</p></IonText>}

            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : "Login"}
            </IonButton>

            <IonButton
              expand="block"
              fill="clear"
              onClick={handleResetPassword}
            >
              Forgot Password?
            </IonButton>

            <IonButton
              expand="block"
              fill="clear"
              color="secondary"
              onClick={handleSignUp}
            >
              Don’t have an account? Sign Up
            </IonButton>

          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={3000}
          onDidDismiss={() => setToast("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
