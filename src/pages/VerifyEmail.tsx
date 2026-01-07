// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { IonPage, IonContent, IonText } from "@ionic/react";
import { auth, db } from "../firebase";
import { applyActionCode } from "firebase/auth";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const oobCode = params.get("oobCode"); // Firebase verification code

      if (!oobCode) {
        setError("Invalid verification link.");
        return;
      }

      try {
        await applyActionCode(auth, oobCode); // marks email as verified
        setMessage("Email verified successfully! Redirecting to login...");
        
        // Wait 2 seconds, then redirect to login page with a success message
        setTimeout(() => {
          history.replace("/login?verified=true");
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to verify email.");
      }
    };

    verifyEmail();
  }, [location.search, history]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {error ? (
          <IonText color="danger">{error}</IonText>
        ) : (
          <IonText color="success">{message}</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmail;
