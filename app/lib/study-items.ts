import type { StudyItemDefinition } from "./types";

export const STUDY_ITEMS: StudyItemDefinition[] = [
  { key: "warmup", label: "예열 · 예습", shortLabel: "예열", tone: "amber" },
  { key: "recall", label: "직후 회상", shortLabel: "회상", tone: "coral" },
  { key: "lectureReview", label: "강의록 회독", shortLabel: "회독", tone: "sage" },
  { key: "notes", label: "노트 정리", shortLabel: "노트", tone: "blue" },
  { key: "pastQuestions", label: "족보 풀기", shortLabel: "족보", tone: "amber" },
  { key: "flashcards", label: "플래시카드", shortLabel: "카드", tone: "coral" },
  { key: "quizMedium", label: "중간 퀴즈", shortLabel: "중간", tone: "sage" },
  { key: "quizHard", label: "어려운 퀴즈", shortLabel: "어려움", tone: "blue" },
];
