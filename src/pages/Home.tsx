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
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonList,
  IonItem,
  IonBadge,
  IonToast
} from '@ionic/react';
import {
  notificationsOutline,
  bookOutline,
  hardwareChipOutline,
  cogOutline,
  codeSlash,
  leafOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

interface Module {
  name: string;
  title: string;
  icon: string;
}

interface HighlightedTopic {
  title: string;
  module: string;
  detail: string;
}

const Home: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showToast, setShowToast] = useState(false);

  /* ---- Simulated progress ---- */
  const progressData = 45;
  const currentModule = 'MODULE 1 - Understanding the Computer';
  const currentTopic = 'Historical Overview of the Computer';

  /* ---- Modules ---- */
  const majorModules: Module[] = [
    { name: 'Module 1', title: 'Understanding the Computer', icon: hardwareChipOutline },
    { name: 'Module 2', title: 'Computer Hardware', icon: cogOutline },
    { name: 'Module 3', title: 'Computer Software', icon: cogOutline },
    { name: 'Module 4', title: 'Programming', icon: codeSlash },
    { name: 'Module 5', title: 'Visual Basic Programming', icon: codeSlash },
    { name: 'Module 6', title: 'Applications', icon: leafOutline },
    { name: 'Module 7', title: 'Threats & Security', icon: hardwareChipOutline }
  ];

  /* ---- Highlighted Topics ---- */
  const highlightedTopics: HighlightedTopic[] = [
    { title: 'Peripheral Devices', module: 'Module 2', detail: 'Hardware Components Part 1 & 2' },
    { title: 'Visual Basic Menus', module: 'Module 5', detail: 'Creating Menu Applications' },
    { title: 'Computer Viruses', module: 'Module 7', detail: 'Types & Prevention' }
  ];

  /* ---- Search Filters ---- */
  const filteredModules = majorModules.filter(m =>
    m.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredTopics = highlightedTopics.filter(t =>
    t.title.toLowerCase().includes(searchText.toLowerCase()) ||
    t.detail.toLowerCase().includes(searchText.toLowerCase()) ||
    t.module.toLowerCase().includes(searchText.toLowerCase())
  );

  /* ---- Handlers ---- */
  const handleNotificationsClick = () => setShowToast(true);
  const handleAvatarClick = () => history.push('/profile');
  const handleModuleClick = (module: Module) => history.push('/notes');

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

        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search modules or topics"
            animated
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* ---- Progress Card ---- */}
        <IonCard color="tertiary" className="ion-margin">
          <IonCardHeader>
            <IonCardSubtitle>{currentModule}</IonCardSubtitle>
            <IonCardTitle>{currentTopic}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressData}%` }}
              />
            </div>
            <p className="progress-text">{progressData}% Complete</p>
          </IonCardContent>
        </IonCard>

        {/* ---- Modules ---- */}
        <h2 className="ion-padding-start">Modules</h2>

        <IonGrid className="ion-padding-horizontal">
          <IonRow>
            {filteredModules.map(mod => (
              <IonCol
                key={mod.name}
                size="6"
                size-md="4"
                size-lg="3"
              >
                <IonCard
                  button
                  className="module-card ion-text-center"
                  onClick={() => handleModuleClick(mod)}
                >
                  <IonCardContent>
                    <IonIcon
                      icon={mod.icon as any}
                      size="large"
                      className="module-icon"
                    />
                    <IonLabel className="module-label">
                      <strong>{mod.name}</strong>
                      <p>{mod.title}</p>
                    </IonLabel>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* ---- Highlighted Topics ---- */}
        <h2 className="ion-padding-start ion-padding-top">
          Highlighted Topics
        </h2>

        <IonList lines="full" className="ion-padding-horizontal">
          {filteredTopics.map(topic => (
            <IonItem
              key={topic.title}
              button
              detail
              onClick={() =>
                handleModuleClick({
                  name: topic.module,
                  title: topic.detail,
                  icon: bookOutline
                })
              }
            >
              <IonIcon icon={bookOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>{topic.title}</h3>
                <p>{topic.detail}</p>
              </IonLabel>
              <IonBadge slot="end" color="light">
                {topic.module}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>

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
