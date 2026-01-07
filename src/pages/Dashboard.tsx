// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonButton,
  IonProgressBar,
  IonSpinner
} from "@ionic/react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";

interface UserData {
  fullName: string;
  matricNumber: string;
  email: string;
  assignmentsCompleted: number;
}

const TOTAL_ASSIGNMENTS = 20;

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        history.replace("/login");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          throw new Error("User document not found");
        }

        const data = snap.data();

        setUserData({
          fullName: data.fullName,
          matricNumber: data.matricNumber,
          email: data.email,
          assignmentsCompleted: data.assignmentsCompleted ?? 0,
        });
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [history]);

  const handleLogout = async () => {
    await auth.signOut();
    history.replace("/login");
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Loading dashboard...</p>
        </IonContent>
      </IonPage>
    );
  }

  const assignmentProgress =
    (userData!.assignmentsCompleted / TOTAL_ASSIGNMENTS);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              Welcome, {userData?.fullName}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p><strong>Matric Number:</strong> {userData?.matricNumber}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Assignments Progress</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                Completed: {userData?.assignmentsCompleted} / {TOTAL_ASSIGNMENTS}
              </p>
            </IonText>

            <IonProgressBar value={assignmentProgress} />
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          color="danger"
          onClick={handleLogout}
          className="ion-margin-top"
        >
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
