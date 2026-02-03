import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonBadge,
  IonToast,
} from '@ionic/react';
import {
  notificationsOutline,
  bookOutline,
  hardwareChipOutline,
  cogOutline,
  codeSlash,
  leafOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

interface Module {
  id: number;
  name: string;
  title: string;
  icon: string;
  currentWeek?: boolean;
  label?: string; // e.g., "Lecture & Assignment this week"
}

const Home: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showToast, setShowToast] = useState(false);

  /* ---- Modules List ---- */
  const modules: Module[] = [
    { id: 1, name: 'Module 1', title: 'Understanding the Computer', icon: hardwareChipOutline },
    { id: 2, name: 'Module 2', title: 'Computer Hardware', icon: cogOutline },
    { id: 3, name: 'Module 3', title: 'Computer Software', icon: cogOutline},
    { id: 4, name: 'Module 4', title: 'Programming', icon: codeSlash, currentWeek: true, label: 'Current'  },
    { id: 5, name: 'Module 5', title: 'Visual Basic Programming', icon: codeSlash },
    { id: 6, name: 'Module 6', title: 'Applications', icon: leafOutline },
    { id: 7, name: 'Module 7', title: 'Threats & Security', icon: hardwareChipOutline }
  ];

  /* ---- Current Week Assignment ---- */
  const currentWeekAssignment = {
    title: 'Module 4 ',
    description: 'Computer Software',
    moduleId: 4,
  };

  /* ---- Search Filters ---- */
  const filteredModules = modules.filter(
    m =>
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      m.title.toLowerCase().includes(searchText.toLowerCase())
  );

  /* ---- Handlers ---- */
  const handleNotificationsClick = () => setShowToast(true);
  const handleAvatarClick = () => history.push('/dashboard');

  const handleModuleClick = (module: Module) => {
    history.push(`/lecture/${module.id}`);
  };

  const handleAssignmentClick = () => {
    history.push(`/assignment`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome, {user?.displayName || 'Student'}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleNotificationsClick}>
              <IonIcon icon={notificationsOutline} size="large" />
            </IonButton>
            <IonButton fill="clear" onClick={handleAvatarClick}>
              <IonAvatar style={{ width: 32, height: 32 }}>
                <img
                  src={user?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'}
                  alt="User Avatar"
                />
              </IonAvatar>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        {/* ---- Modules Section ---- */}
        <h2 className="ion-padding-start">Modules</h2>
        <IonGrid>
          <IonRow>
            {filteredModules.map(mod => (
              <IonCol key={mod.id} size="6" size-md="4">
                <IonCard
                  button
                  className={`module-card ${mod.currentWeek ? 'current-week' : ''}`}
                  onClick={() => handleModuleClick(mod)}
                >
                  <IonCardContent className="ion-text-center">
                    <IonIcon icon={mod.icon as any} size="large" className="module-icon" />
                    <IonLabel>
                      <strong>{mod.name}</strong>
                      <p>{mod.title}</p>
                      {mod.label && <IonBadge color="success">{mod.label}</IonBadge>}
                    </IonLabel>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* ---- Current Week Assignment ---- */}
        <h2 className="ion-padding-start ion-padding-top">Assignment This Week</h2>
        <IonCard button onClick={handleAssignmentClick}>
          <IonCardContent>
            <IonLabel>
              <p>{currentWeekAssignment.description}</p>
            </IonLabel>
            <IonBadge color="primary">Module {currentWeekAssignment.moduleId}</IonBadge>
          </IonCardContent>
        </IonCard>

        {/* ---- Toast ---- */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="No new notifications"
          duration={2000}
          color="primary"
        />

      </IonContent>
    </IonPage>
  );
};

export default Home;
