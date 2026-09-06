export const STUDY_ITEM_KEYS = [
  "warmup",
  "recall",
  "lectureReview",
  "notes",
  "pastQuestions",
  "flashcards",
  "quizMedium",
  "quizHard",
] as const;

export type StudyItemKey = (typeof STUDY_ITEM_KEYS)[number];

export type StudyItemDefinition = {
  key: StudyItemKey;
  label: string;
  shortLabel: string;
  tone: "amber" | "coral" | "sage" | "blue";
};

export type SessionStatus = "scheduled" | "cancelled" | "review";

export type CourseSession = {
  id: string;
  sequence: number;
  week: number;
  period: number;
  scheduledAt: string;
  originalScheduledAt: string;
  title: string;
  professor: string;
  room: string;
  online: boolean;
  changeNote?: string | null;
  status: SessionStatus;
  sourceGroupId?: string | null;
  notebookUrl?: string | null;
};

export type SourceGroup = {
  id: string;
  sessionSequences: number[];
  title: string;
  professor: string;
  fileName?: string | null;
  driveUrl?: string | null;
  notebookName: string;
  notebookUrl?: string | null;
  materialStatus: "waiting" | "ready" | "notebook-ready" | "review";
  warmup?: StudyMaterial | null;
  recall?: StudyMaterial | null;
  noteGuide?: StudyMaterial | null;
};

export type StudyMaterial = {
  generatedAt: string;
  content: string;
};

export type CourseManifest = {
  schemaVersion: 1;
  slug: string;
  name: string;
  cycleLabel: string;
  timezone: string;
  sourceVersion: string;
  driveFolderUrl?: string | null;
  sessions: CourseSession[];
  sourceGroups: SourceGroup[];
  exam?: {
    scheduledAt: string;
    room: string;
  } | null;
};

export type ProgressRow = {
  sessionId: string;
  itemKey: StudyItemKey;
  count: number;
  updatedAt: string;
};
