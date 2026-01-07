import React, { useState } from "react";
import jsPDF from "jspdf";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadioGroup,
  IonRadio,
  IonText,
  IonProgressBar,
  IonChip,
} from "@ionic/react";

import modulesData from "../data/modules.json";
import quizzesData from "../data/quizzes.json";

/* ================= TYPES ================= */

type Topic = {
  id: number;
  title: string;
  isCompleted: boolean;
};

type Module = {
  moduleTitle: string;
  expanded: boolean;
  topics: Topic[];
};

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: string;
};

type QuestionResult = {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

/* ================= COMPONENT ================= */

const Assignment: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  /* ================= HELPERS ================= */

  const getQuizForTopic = (topicId: number): QuizQuestion[] => {
    const quiz = quizzesData.find((q) => q.id === topicId);
    if (!quiz) return [];
    return quiz.questions.map((q, index) => ({
      ...q,
      id: index + 1,
    }));
  };

  const buildQuestionResults = (): QuestionResult[] => {
    return quizQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      selectedAnswer: answers[q.id] || "Not answered",
      correctAnswer: q.correct,
      isCorrect: answers[q.id] === q.correct,
    }));
  };

  /* ================= ACTIONS ================= */

  const handleTopicClick = (topicId: number, topicTitle: string) => {
    setSelectedTopic({ id: topicId, title: topicTitle });
    setQuizQuestions(getQuizForTopic(topicId));
    setAnswers({});
    setScore(0);
    setShowResult(false);
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    let tempScore = 0;

    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        tempScore++;
      }
    });

    setScore(tempScore);
    setShowResult(true);

    const user = auth.currentUser;
    if (!user || !selectedTopic) return;

    const questionResults = buildQuestionResults();

    try {
      await addDoc(collection(db, "assignment_results"), {
        userId: user.uid,
        email: user.email,

        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,

        score: tempScore,
        totalQuestions: quizQuestions.length,
        percentage: Math.round(
          (tempScore / quizQuestions.length) * 100
        ),

        questionResults, // ✅ detailed per-question results

        submittedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error saving assignment result:", error);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Assignment Results", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Topic: ${selectedTopic?.title}`, 10, y);
    y += 8;

    doc.text(`Score: ${score} / ${quizQuestions.length}`, 10, y);
    y += 10;

    quizQuestions.forEach((q, index) => {
      doc.text(`${index + 1}. ${q.question}`, 10, y);
      y += 6;
      doc.text(`Your answer: ${answers[q.id] || "Not answered"}`, 10, y);
      y += 6;
      doc.text(`Correct answer: ${q.correct}`, 10, y);
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    });

    doc.save("assignment_results.pdf");
  };

  /* ================= UI ================= */

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {!selectedTopic ? (
          <>
            <IonText color="medium">
              <h2>Select a Topic</h2>
            </IonText>

            {modulesData.map((module: Module) => (
              <IonCard key={module.moduleTitle}>
                <IonCardHeader>
                  <IonCardTitle>{module.moduleTitle}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  {module.topics.map((topic) => (
                    <IonItem
                      key={topic.id}
                      button
                      lines="none"
                      onClick={() =>
                        handleTopicClick(topic.id, topic.title)
                      }
                    >
                      <IonLabel>{topic.title}</IonLabel>
                      <IonChip color="primary">Quiz</IonChip>
                    </IonItem>
                  ))}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{selectedTopic.title}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonProgressBar
                  value={
                    Object.keys(answers).length /
                    quizQuestions.length
                  }
                />
                <IonText color="medium">
                  <p>
                    Answered {Object.keys(answers).length} of{" "}
                    {quizQuestions.length}
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            {quizQuestions.map((q, index) => (
              <IonCard key={q.id}>
                <IonCardHeader>
                  <IonCardTitle>
                    Question {index + 1}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText>
                    <p>{q.question}</p>
                  </IonText>

                  <IonRadioGroup
                    value={answers[q.id]}
                    onIonChange={(e) =>
                      handleAnswerChange(q.id, e.detail.value)
                    }
                  >
                    {q.options.map((opt) => (
                      <IonItem key={opt}>
                        <IonRadio
                          slot="start"
                          value={opt}
                          disabled={showResult}
                        />
                        <IonLabel>{opt}</IonLabel>
                      </IonItem>
                    ))}
                  </IonRadioGroup>

                  {showResult && (
                    <IonText
                      color={
                        answers[q.id] === q.correct
                          ? "success"
                          : "danger"
                      }
                    >
                      <p>
                        {answers[q.id] === q.correct
                          ? "Correct"
                          : `Correct answer: ${q.correct}`}
                      </p>
                    </IonText>
                  )}
                </IonCardContent>
              </IonCard>
            ))}

            {!showResult && (
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleSubmit}
              >
                Submit Assignment
              </IonButton>
            )}

            {showResult && (
              <IonCard className="ion-margin-top">
                <IonCardHeader>
                  <IonCardTitle>Result Summary</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText>
                    <h2>
                      {score} / {quizQuestions.length}
                    </h2>
                  </IonText>

                  <IonButton
                    expand="block"
                    className="ion-margin-top"
                    onClick={handleDownload}
                  >
                    Download Result PDF
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="ion-margin-top"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Choose Another Topic
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Assignment;
