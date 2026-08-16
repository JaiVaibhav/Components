export const STATUSES = [
  'not_started',
  'learning',
  'practiced',
  'revised',
  'interview_ready',
] as const;
export type TopicStatus = (typeof STATUSES)[number];
export const LEVELS = [
  'Fresher',
  'Junior',
  'Mid',
  'Senior',
  'Staff',
  'Principal',
  'Architect',
] as const;
export type Level = (typeof LEVELS)[number];
export type ResourceType = 'Documentation' | 'Article' | 'Video' | 'Reference';
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  targetRoles: string[];
  minimumLevel: Level;
  maximumLevel: Level;
  createdAt: number;
}
export interface Topic {
  id: string;
  learningPathId: string;
  parentId: string | null;
  title: string;
  description: string;
  order: number;
  status: TopicStatus;
  needsRevision: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface Note {
  id: string;
  topicId: string;
  markdown: string;
  updatedAt: number;
}
export interface CodeSnippet {
  id: string;
  topicId: string;
  filename: string;
  language: string;
  code: string;
  updatedAt: number;
}
export interface Resource {
  id: string;
  topicId: string;
  title: string;
  type: ResourceType;
  url: string;
}
export interface RecentTopic {
  topicId: string;
  openedAt: number;
}
export interface Settings {
  id: 'user';
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  role: string;
  level: Level;
}
export interface Backup {
  version: 1;
  exportedAt: number;
  learningPaths: LearningPath[];
  topics: Topic[];
  notes: Note[];
  snippets: CodeSnippet[];
  resources: Resource[];
  recentTopics: RecentTopic[];
  settings: Settings[];
}
export interface AnalyticsSnapshot {
  id?: number;
  date: string;
  learningPathId: string;
  overallProgress: number;
  totalTopics: number;
  notStarted: number;
  learning: number;
  practiced: number;
  revised: number;
  interviewReady: number;
  topicsInProgress: number;
  topicsNeedingRevision: number;
  learningPathsCount: number;
}
export interface LearningActivity {
  id?: number;
  date: string;
  topicsUpdated: number;
  topicsPracticed: number;
  topicsRevised: number;
  topicsCompleted: number;
  notesUpdated: number;
  snippetsUpdated: number;
}
export const uid = () => crypto.randomUUID();
export const statusLabel = (status: TopicStatus) =>
  status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

