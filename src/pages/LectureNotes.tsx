import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCheckbox,
  IonNote,
  IonSearchbar,
  IonProgressBar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonBadge,
} from "@ionic/react";

import {
  folderOutline,
  chevronDownOutline,
  chevronForwardOutline,
  documentTextOutline,
} from "ionicons/icons";

import { useState } from "react";
import { useHistory } from "react-router-dom";
import "./LectureNotes.css";

/* ------------------------------
   Modules Data
-------------------------------- */
const initialModules = [
  {
    moduleTitle: "MODULE 1 - Understanding the Computer",
    expanded: true,
    topics: [
      { id: 101, title: "Basic Concepts", isCompleted: false },
      { id: 102, title: "Historical Overview of the Computer", isCompleted: false },
      { id: 103, title: "Classification of Computers", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 2 - Computer Hardware",
    expanded: false,
    topics: [
      { id: 201, title: "Hardware Components (Part 1)", isCompleted: false },
      { id: 202, title: "Peripheral Devices", isCompleted: false },
      { id: 203, title: "Auxiliary Equipment", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 3 - Computer Software",
    expanded: false,
    topics: [
      { id: 301, title: "Computer Software (1)", isCompleted: false },
      { id: 302, title: "Computer Software (2)", isCompleted: false },
      { id: 303, title: "Categories of Software", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 4 - Programming the Computer",
    expanded: false,
    topics: [
      { id: 401, title: "Computer Languages", isCompleted: false },
      { id: 402, title: "Basic Principles of Computer Programming", isCompleted: false },
      { id: 403, title: "Flowcharts and Algorithms", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 5 - Visual Basic Programming",
    expanded: false,
    topics: [
      { id: 501, title: "Programming in Visual Basic (Part 1)", isCompleted: false },
      { id: 502, title: "Visual Basic Project Window", isCompleted: false },
      { id: 503, title: "Creating Menu Applications", isCompleted: false },
      { id: 504, title: "Analysing Visual Basic Data", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 6 - Areas of Application of Computers",
    expanded: false,
    topics: [
      { id: 601, title: "Applications in Education", isCompleted: false },
      { id: 602, title: "Applications in Business and Industry", isCompleted: false },
      { id: 603, title: "Applications in Government & Others", isCompleted: false },
    ],
  },
  {
    moduleTitle: "MODULE 7 - Threats to the Computer",
    expanded: false,
    topics: [
      { id: 701, title: "Computer Viruses and Related Threats", isCompleted: false },
    ],
  },
];

/* ------------------------------
   Component
-------------------------------- */
const LectureNotes: React.FC = () => {
  const [modulesData, setModulesData] = useState(initialModules);
  const [searchText, setSearchText] = useState("");
  const history = useHistory();

  /* ---- Progress ---- */
  const totalTopics = modulesData.reduce((a, m) => a + m.topics.length, 0);
  const completedTopics = modulesData.reduce(
    (a, m) => a + m.topics.filter(t => t.isCompleted).length,
    0
  );
  const progressPercent = totalTopics ? completedTopics / totalTopics : 0;

  /* ---- Handlers ---- */
  const toggleCompletion = (moduleIndex: number, topicId: number) => {
    setModulesData(prev =>
      prev.map((m, i) =>
        i === moduleIndex
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
              ),
            }
          : m
      )
    );
  };

  const toggleExpandModule = (index: number) => {
    setModulesData(prev =>
      prev.map((m, i) =>
        i === index ? { ...m, expanded: !m.expanded } : m
      )
    );
  };

  const handleTopicClick = (topicId: number) => {
    history.push(`/lecture/${topicId}`);
  };

  /* ---- Search Filter ---- */
  const filteredModules = modulesData.map(m => ({
    ...m,
    topics: m.topics.filter(t =>
      t.title.toLowerCase().includes(searchText.toLowerCase())
    ),
  }));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>COS 101 Lecture Notes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        {/* Search Bar */}
        <IonSearchbar
          value={searchText}
          onIonInput={e => setSearchText(e.detail.value!)}
          placeholder="Search lecture topics..."
          animated
        />

        {/* Progress Card */}
        <IonCard color="light" className="ion-margin-vertical">
          <IonCardContent>
            <IonText color="medium">
              Overall Progress: {completedTopics} / {totalTopics} completed
            </IonText>
            <IonProgressBar value={progressPercent} color="tertiary" />
          </IonCardContent>
        </IonCard>

        {/* Modules List */}
        {filteredModules.map((module, moduleIndex) => (
          <IonCard key={moduleIndex} className="ion-margin-bottom" style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            
            {/* Module Header */}
            <IonItem
              button
              lines="none"
              onClick={() => toggleExpandModule(moduleIndex)}
              style={{ backgroundColor: '#f9f9f9', borderRadius: '12px 12px 0 0' }}
            >
              <IonIcon slot="start" icon={folderOutline} />
              <IonLabel>
                <strong>{module.moduleTitle}</strong>
              </IonLabel>
              <IonNote slot="end">
                {module.topics.filter(t => t.isCompleted).length}/{module.topics.length} done
              </IonNote>
              <IonIcon
                slot="end"
                icon={module.expanded ? chevronDownOutline : chevronForwardOutline}
              />
            </IonItem>

            {/* Topics List */}
            {module.expanded && (
              <IonList>
                {module.topics.map(topic => (
                  <IonItem
                    key={topic.id}
                    button
                    className="topic-item"
                    onClick={() => handleTopicClick(topic.id)}
                    style={{ paddingLeft: '16px', borderRadius: '0 0 12px 12px', marginBottom: '4px', backgroundColor: '#fff' }}
                  >
                    <IonCheckbox
                      slot="start"
                      checked={topic.isCompleted}
                      onIonChange={e => {
                        e.stopPropagation();
                        toggleCompletion(moduleIndex, topic.id);
                      }}
                    />
                    <IonIcon slot="start" icon={documentTextOutline} />
                    <IonLabel className={topic.isCompleted ? "completed-topic" : ""}>
                      {topic.title}
                    </IonLabel>
                    {topic.isCompleted && <IonBadge color="success" slot="end">Done</IonBadge>}
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default LectureNotes;
