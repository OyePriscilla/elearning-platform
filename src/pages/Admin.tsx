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
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonInput,
} from "@ionic/react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import jsPDF from "jspdf";

interface AssignmentResultData {
  id: string; // Firestore doc ID
  userId: string;
  email: string;
  moduleTitle: string;
  score: number;
  totalQuestions: number;
}

interface ModuleGroup {
  moduleTitle: string;
  assignments: AssignmentResultData[];
}

const ADMIN_EMAIL = "oyebadepriscilla22@gmail.com";

const Admin: React.FC = () => {
  const [modules, setModules] = useState<ModuleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user || user.email !== ADMIN_EMAIL) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      await fetchResults();
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const fetchResults = async () => {
    const snapshot = await getDocs(collection(db, "assignment_results"));
    const results: AssignmentResultData[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<AssignmentResultData, "id">),
    }));

    const grouped: Record<string, AssignmentResultData[]> = {};
    results.forEach(r => {
      if (!grouped[r.moduleTitle]) grouped[r.moduleTitle] = [];
      grouped[r.moduleTitle].push(r);
    });

    const moduleGroups: ModuleGroup[] = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map(title => ({
        moduleTitle: title,
        assignments: grouped[title].sort((a, b) =>
          (a.email ?? a.userId).toLowerCase().localeCompare((b.email ?? b.userId).toLowerCase())
        ),
      }));

    setModules(moduleGroups);
  };

  const downloadModulePDF = (module: ModuleGroup) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Module: ${module.moduleTitle}`, 10, 20);
    doc.setFontSize(12);

    let y = 30;
    module.assignments.forEach(a => {
      doc.text(`${a.email}: ${a.score} / ${a.totalQuestions}`, 10, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    });

    doc.save(`${module.moduleTitle}_assignments.pdf`);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment for the student?")) return;

    try {
      await deleteDoc(doc(db, "assignment_results", assignmentId));
      await fetchResults(); // Refresh UI
      alert("Assignment deleted successfully!");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment.");
    }
  };

  const filteredModules = modules.map(module => ({
    ...module,
    assignments: module.assignments.filter(a =>
      a.email.toLowerCase().includes(searchEmail.toLowerCase())
    ),
  }));

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding" style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (!isAdmin) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Access denied</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonInput
          placeholder="Search student by email..."
          value={searchEmail}
          onIonChange={e => setSearchEmail(e.detail.value!)}
          className="ion-margin-bottom"
        />

        {filteredModules.length === 0 ? (
          <p>No assignments found</p>
        ) : (
          filteredModules.map(module => (
            <IonCard key={module.moduleTitle}>
              <IonCardHeader>
                <IonCardTitle>{module.moduleTitle}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton expand="block" color="primary" onClick={() => downloadModulePDF(module)}>
                  Download PDF
                </IonButton>
                <IonList>
                  {module.assignments.map(a => (
                    <IonItem key={a.id}>
                      <IonLabel>{a.email}</IonLabel>
                      <IonBadge color="secondary">{a.score} / {a.totalQuestions}</IonBadge>
                      <IonButton
                        slot="end"
                        color="danger"
                        size="small"
                        onClick={() => handleDeleteAssignment(a.id)}
                      >
                        Delete
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Admin;
