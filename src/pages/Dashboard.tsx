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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner
} from "@ionic/react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";

import jsPDF from "jspdf";
import "jspdf-autotable";

interface UserData {
  fullName: string;
  matricNumber: string;
  email: string;
}

interface QuestionResult {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface AssignmentResultData {
  moduleTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  questionResults: QuestionResult[];
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [assignments, setAssignments] = useState<AssignmentResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        history.replace("/login");
        return;
      }

      try {
        // Fetch user details
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User document not found");
        const data = userSnap.data();
        setUserData({
          fullName: data.fullName,
          matricNumber: data.matricNumber,
          email: data.email
        });

        // Fetch student's assignments
        const assignmentsQuery = query(
          collection(db, "assignment_results"),
          where("userId", "==", user.uid)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const results: AssignmentResultData[] = assignmentsSnap.docs.map(docSnap => docSnap.data() as AssignmentResultData);

        // Sort alphabetically by module
        results.sort((a, b) => a.moduleTitle.localeCompare(b.moduleTitle));

        setAssignments(results);

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

  // -----------------------------
  // Download single module as PDF with results
  // -----------------------------
  const downloadModulePDF = (assignment: AssignmentResultData) => {
    if (!userData) return;

    const doc = new jsPDF();
    const dateSubmitted = assignment.submittedAt?.toDate ? assignment.submittedAt.toDate().toLocaleString() : "";

    // Header
    doc.setFontSize(18);
    doc.text("Assignment Result", 105, 20, { align: "center" });

    // User info
    doc.setFontSize(12);
    doc.text(`Student: ${userData.fullName}`, 20, 40);
    doc.text(`Matric Number: ${userData.matricNumber}`, 20, 50);
    doc.text(`Email: ${userData.email}`, 20, 60);
    doc.text(`Module: ${assignment.moduleTitle}`, 20, 70);
    doc.text(`Submitted At: ${dateSubmitted}`, 20, 80);

    // Score Box
    doc.setFillColor(230, 240, 255);
    doc.rect(20, 90, 170, 20, "F");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 150);
    doc.text(`Score: ${assignment.score} / ${assignment.totalQuestions}`, 105, 104, { align: "center" });

    // Table of questions and answers
    if (assignment.questionResults?.length) {
      const tableData = assignment.questionResults.map((q, idx) => [
        (idx + 1).toString(),
        q.question,
        q.studentAnswer,
        q.correctAnswer,
        q.isCorrect ? "✅" : "❌"
      ]);

      (doc as any).autoTable({
        startY: 120,
        head: [["#", "Question", "Your Answer", "Correct Answer", "Result"]],
        body: tableData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      });
    }

    doc.save(`${assignment.moduleTitle}_Result.pdf`);
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* User Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome, {userData?.fullName}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p><strong>Matric Number:</strong> {userData?.matricNumber}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Assignment Results */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Your Assignments</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {assignments.length === 0 ? (
              <p>No assignments submitted yet.</p>
            ) : (
              <IonList>
                {assignments.map((a, idx) => (
                  <IonItem key={idx}>
                    <IonLabel>
                      {a.moduleTitle}
                      <p style={{ fontSize: "0.85rem", color: "gray" }}>
                        {a.submittedAt?.toDate ? a.submittedAt.toDate().toLocaleString() : ""}
                      </p>
                    </IonLabel>
                    <IonBadge color="primary">{a.score} / {a.totalQuestions}</IonBadge>
                    
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        <IonButton expand="block" color="danger" onClick={handleLogout} className="ion-margin-top">
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
