import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
  IonText,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonChip,
} from "@ionic/react";

import modulesData from "../data/modules.json";
import quizzesData from "../data/quizzes.json";

/* ================= TYPES ================= */

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

const QUIZ_DURATION = 20 * 60; // 20 minutes in seconds

const Assignment: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
  const [moduleSettings, setModuleSettings] = useState<{ [key: string]: boolean }>({});

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!selectedModule) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [selectedModule]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ================= FETCH ATTEMPTS & SETTINGS ================= */

  const fetchAttempts = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "assignment_results"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);

    const attemptCount: { [key: string]: number } = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      const module = data.moduleTitle;
      attemptCount[module] = (attemptCount[module] || 0) + 1;
    });

    setAttempts(attemptCount);
  };

  const fetchModuleSettings = async () => {
    const snapshot = await getDocs(collection(db, "module_settings"));
    const settings: { [key: string]: boolean } = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      settings[data.moduleTitle] = data.enabled;
    });
    setModuleSettings(settings);
  };

  useEffect(() => {
    fetchAttempts();
    fetchModuleSettings();
  }, []);

  /* ================= HELPERS ================= */

  const getQuizForModule = (moduleTitle: string): QuizQuestion[] => {
    const quiz = quizzesData.find((q) => q.moduleTitle === moduleTitle);
    if (!quiz) return [];
    return quiz.questions.map((q, index) => ({ ...q, id: index + 1 }));
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

  const handleModuleClick = (moduleTitle: string) => {
    setSelectedModule(moduleTitle);
    setQuizQuestions(getQuizForModule(moduleTitle));
    setAnswers({});
    setScore(0);
    setShowResult(false);
    setTimeLeft(QUIZ_DURATION);
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (showResult) return; // prevent double submit

    let tempScore = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) tempScore++;
    });
    setScore(tempScore);
    setShowResult(true);

    const user = auth.currentUser;
    if (!user || !selectedModule) return;

    const questionResults = buildQuestionResults();
    const attemptNumber = (attempts[selectedModule] || 0) + 1;

    try {
      await addDoc(collection(db, "assignment_results"), {
        userId: user.uid,
        email: user.email,
        moduleTitle: selectedModule,
        score: tempScore,
        totalQuestions: quizQuestions.length,
        percentage: Math.round((tempScore / quizQuestions.length) * 100),
        attemptNumber,
        duration: 20,
        timeRemaining: timeLeft,
        questionResults,
        submittedAt: Timestamp.now(),
      });

      // update attempts in state immediately
      setAttempts((prev) => ({
        ...prev,
        [selectedModule]: attemptNumber,
      }));
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
    doc.text(`Module: ${selectedModule}`, 10, y);
    y += 8;

    doc.text(`Score: ${score} / ${quizQuestions.length}`, 10, y);
    y += 8;

    if (!selectedModule) return;

    doc.text(`Attempt: ${attempts[selectedModule] || 1} of 2`, 10, y);
    y += 8;
    doc.text(`Time Remaining: ${formatTime(timeLeft)}`, 10, y);
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
          <IonTitle>Module Assignment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {!selectedModule ? (
          <>
            <IonText color="medium">
              <h2>Select a Module Assignment</h2>
            </IonText>

            {modulesData.map((module) => {
              const attemptCount = attempts[module.moduleTitle] || 0;
              const isEnabled = moduleSettings[module.moduleTitle] ?? true; // default enabled

              let buttonText = "Start Assignment";
              if (!isEnabled) buttonText = "Disabled by Admin";
              else if (attemptCount >= 2) buttonText = "Max Attempts Reached";

              return (
                <IonCard key={module.moduleTitle}>
                  <IonCardHeader>
                    <IonCardTitle>{module.moduleTitle}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonButton
                      expand="block"
                      disabled={!isEnabled || attemptCount >= 2}
                      onClick={() => handleModuleClick(module.moduleTitle)}
                    >
                      {buttonText}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{selectedModule}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonChip color={timeLeft < 300 ? "danger" : "primary"}>
                  Time Left: {formatTime(timeLeft)}
                </IonChip>
                <IonProgressBar
                  value={Object.keys(answers).length / quizQuestions.length}
                  className="ion-margin-top"
                />
                <IonText color="medium">
                  <p>
                    Answered {Object.keys(answers).length} of {quizQuestions.length}
                  </p>
                  <p>
                    Attempt {(attempts[selectedModule] || 0) + 1} of 2
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            {quizQuestions.map((q, index) => (
              <IonCard key={q.id}>
                <IonCardHeader>
                  <IonCardTitle>Question {index + 1}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText>
                    <p>{q.question}</p>
                  </IonText>

                  <IonRadioGroup
                    value={answers[q.id]}
                    onIonChange={(e) => handleAnswerChange(q.id, e.detail.value)}
                  >
                    {q.options.map((opt) => (
                      <IonItem key={opt}>
                        <IonLabel>{opt}</IonLabel>
                        <IonRadio value={opt} disabled={showResult} />
                      </IonItem>
                    ))}
                  </IonRadioGroup>


                  {showResult && (
                    <IonText color={answers[q.id] === q.correct ? "success" : "danger"}>
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
              <IonButton expand="block" className="ion-margin-top" onClick={handleSubmit}>
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
                    <h2>{score} / {quizQuestions.length}</h2>
                  </IonText>

                  <IonButton expand="block" className="ion-margin-top" onClick={handleDownload}>
                    Download Result PDF
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="outline"
                    className="ion-margin-top"
                    onClick={() => setSelectedModule(null)}
                  >
                    Choose Another Module
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
