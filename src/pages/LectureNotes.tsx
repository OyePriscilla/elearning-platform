import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonText,
  IonBadge,
  IonIcon,
} from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import "./LectureNotes.css";

/* ------------------------------
   Modules Data (no subtopics)
-------------------------------- */
const modulesData = [
  { id: 1, moduleTitle: "MODULE 1 - Understanding the Computer", isCompleted: false },
  { id: 2, moduleTitle: "MODULE 2 - Computer Hardware", isCompleted: false },
  { id: 3, moduleTitle: "MODULE 3 - Computer Software", isCompleted: false },
  { id: 4, moduleTitle: "MODULE 4 - Programming the Computer", isCompleted: false },
  { id: 5, moduleTitle: "MODULE 5 - Visual Basic Programming", isCompleted: false },
  { id: 6, moduleTitle: "MODULE 6 - Areas of Application of Computers", isCompleted: false },
  { id: 7, moduleTitle: "MODULE 7 - Threats to the Computer", isCompleted: false },
];

/* ------------------------------
   Component
-------------------------------- */
const LectureNotes: React.FC = () => {
  const [modules, setModules] = useState(modulesData);
  const history = useHistory();

  /* ---- Progress ---- */
  const completedModules = modules.filter(m => m.isCompleted).length;
  const progressPercent = modules.length ? completedModules / modules.length : 0;

  /* ---- Handlers ---- */
  const handleModuleClick = (moduleId: number) => {
    // Mark module as completed (optional)
    setModules(prev =>
      prev.map(m => (m.id === moduleId ? { ...m, isCompleted: true } : m))
    );

    // Navigate to LectureDetail page
    history.push(`/lecture/${moduleId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>COS 101 Lecture Notes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Progress Bar */}
        <IonCard color="light" className="ion-margin-vertical">
          <IonCard>
            <IonProgressBar value={progressPercent} color="tertiary" />
            <IonText color="medium">
              Modules Completed: {completedModules} / {modules.length}
            </IonText>
          </IonCard>
        </IonCard>

        {/* Modules List */}
        {modules.map(module => (
          <IonCard key={module.id} className="ion-margin-bottom" style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <IonItem
              button
              lines="none"
              onClick={() => handleModuleClick(module.id)}
              style={{ backgroundColor: '#f9f9f9', borderRadius: '12px' }}
            >
              <IonLabel>
                <strong>{module.moduleTitle}</strong>
              </IonLabel>
              {module.isCompleted && <IonBadge color="success" slot="end">Done</IonBadge>}
              <IonIcon icon={chevronForwardOutline} slot="end" />
            </IonItem>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default LectureNotes;
