import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonText } from "@ionic/react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";

const ConfirmEmail: React.FC = () => {
  const handleResend = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email resent. Check your inbox.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Confirm Your Email</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <p>
            Thank you for registering! Please check your email and verify your account
            before logging in.
          </p>
        </IonText>
        <IonButton expand="block" onClick={handleResend} className="ion-margin-top">
          Resend Verification Email
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmEmail;
