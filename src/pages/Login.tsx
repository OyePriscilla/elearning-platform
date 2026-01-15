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
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
  IonToast,
  IonIcon,
} from "@ionic/react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';


const allowedEmails = [
  "livingsambank@gmail.com",
  "oyebadepriscilla22@gmail.com",
  "ofoegbupeter2020@gmail.com",
  "henrycjonathan@gmail.com",
  "ntumary3@gmail.com",
  "temiloluwatemidayo29@gmail.com",
  "fortunec930@gmail.com",
];

const Login: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      setInfo("Email verified! Please log in to continue.");
    }
  }, [location.search]);

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

      if (!allowedEmails.includes(user.email!)) {
        await auth.signOut();
        throw new Error("Your email is not authorized to access this app.");
      }

      if (!user.emailVerified) {
        await auth.signOut();
        throw new Error("Please verify your email before logging in.");
      }

      history.replace("/home");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSignUp = () => {
    history.push("/register");
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
              <h2>Student Login</h2>
              <p>Enter your credentials to continue</p>
            </IonText>

            <IonItem className="form-item">
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} />
            </IonItem>

           <IonItem className="form-item">
          <IonLabel position="stacked">Password</IonLabel>
          <IonInput
            type={showPassword ? 'text' : 'password'}
            value={password}
            onIonChange={e => setPassword(e.detail.value!)}
          />
          <IonButton
            fill="clear"
            slot="end"
            onClick={toggleShowPassword}
            style={{ marginRight: 0 }}
          >
            <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
          </IonButton>
        </IonItem>

            {error && <IonText color="danger" className="ion-padding-top">{error}</IonText>}
            {info && <IonText color="success" className="ion-padding-top">{info}</IonText>}

            <IonButton expand="block" className="ion-margin-top" onClick={handleLogin} disabled={loading}>
              {loading ? <IonSpinner name="crescent" /> : "Login"}
            </IonButton>

            <IonButton expand="block" fill="clear" onClick={handleResetPassword}>
              Forgot Password?
            </IonButton>

            <IonButton expand="block" fill="clear" color="secondary" onClick={handleSignUp}>
              Don’t have an account? Sign Up
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
export default Login;
