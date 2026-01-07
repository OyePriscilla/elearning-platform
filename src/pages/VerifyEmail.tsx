// src/pages/VerifyEmail.tsx
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent, IonText, IonSpinner } from "@ionic/react";

const VerifyEmail: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    // Firebase has already verified the email at this point
    const timer = setTimeout(() => {
      history.replace("/login?verified=true");
    }, 2000);

    return () => clearTimeout(timer);
  }, [history]);

  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center">
        <IonSpinner />
        <IonText color="success">
          <p>Email verified successfully!</p>
          <p>Redirecting to login…</p>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmail;
