// src/pages/Register.tsx
import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonText,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const history = useHistory();

  const handleRegister = async () => {
    if (!fullName || !matricNumber || !email || !password) {
      setToast("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setToast("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, { displayName: fullName });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        matricNumber,
        email,
        lecturesProgress: 0,
        assignmentsCompleted: 0,
        totalAssignments: 20, // total assignments
        createdAt: serverTimestamp(),
      });

      // Send verification email with continue URL to login
      await sendEmailVerification(userCredential.user, {
        url: "https://e-learning-549db.web.app/login?verified=true",
        handleCodeInApp: true,
      });

      setToast("Registration successful! Check your email to verify your account.");
      setTimeout(() => history.replace("/login"), 7200);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setToast("Email already registered");
      } else if (err.code === "auth/weak-password") {
        setToast("Weak password");
      } else {
        setToast(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard className="auth-card">
          <IonCardContent>
            <IonText className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in your details to continue</p>
            </IonText>

            <IonItem className="form-item">
              <IonLabel position="stacked">Full Name</IonLabel>
              <IonInput value={fullName} onIonChange={e => setFullName(e.detail.value!)} />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="stacked">Matric Number</IonLabel>
              <IonInput value={matricNumber} onIonChange={e => setMatricNumber(e.detail.value!)} />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} />
            </IonItem>

            <IonItem className="form-item">
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
            </IonItem>

            <IonButton expand="block" className="ion-margin-top" onClick={handleRegister} disabled={loading}>
              {loading ? <IonSpinner name="crescent" /> : "Register"}
            </IonButton>

            <IonButton expand="block" fill="clear" className="ion-margin-top" onClick={() => history.push("/login")}>
              Already have an account? Login
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast isOpen={!!toast} message={toast} duration={3000} onDidDismiss={() => setToast("")} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
