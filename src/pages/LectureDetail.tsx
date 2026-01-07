import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import lectures from "../data/lectures.json";

type Lecture = {
  id: number;
  title: string;
  pdf?: string;
  content?: string;
};

const LectureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const lecture = (lectures as Lecture[]).find(
    l => l.id === Number(id)
  );

  if (!lecture || !lecture.pdf) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">
            <p>Lecture not found or PDF unavailable.</p>
          </IonText>
          <IonButton expand="block" onClick={() => history.goBack()}>
            Go Back
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{lecture.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        {/* Optional lecture description */}
        {lecture.content && (
          <IonText>
            <p>{lecture.content}</p>
          </IonText>
        )}

        {/* PDF VIEWER (DEFAULT) */}
        <div style={{ height: "80vh", marginTop: 12 }}>
          <iframe
            src={lecture.pdf}
            title="Lecture PDF"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>

        {/* DOWNLOAD PDF (Reliable) */}
        <a
          href={lecture.pdf}
          target="_blank"
          rel="noopener noreferrer"
          download
          style={{ textDecoration: "none" }}
        >
          <IonButton expand="block" className="ion-margin-top">
            Download PDF
          </IonButton>
        </a>

        {/* BACK BUTTON */}
        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.goBack()}
          className="ion-margin-top"
        >
          Go Back
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default LectureDetail;