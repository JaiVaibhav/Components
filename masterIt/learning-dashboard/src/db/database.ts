import Dexie, { type Table } from 'dexie';
import type {
  Backup,
  CodeSnippet,
  LearningPath,
  Note,
  RecentTopic,
  Resource,
  Settings,
  Topic,
} from '../models/types';

class LearningDatabase extends Dexie {
  learningPaths!: Table<LearningPath, string>;
  topics!: Table<Topic, string>;
  notes!: Table<Note, string>;
  snippets!: Table<CodeSnippet, string>;
  resources!: Table<Resource, string>;
  recentTopics!: Table<RecentTopic, string>;
  settings!: Table<Settings, string>;
  constructor() {
    super('learning-dashboard');
    this.version(1).stores({
      learningPaths: 'id, title, *targetRoles',
      topics: 'id, learningPathId, parentId, status, needsRevision, order',
      notes: 'id, topicId',
      snippets: 'id, topicId, filename',
      resources: 'id, topicId, type',
      recentTopics: 'topicId, openedAt',
      settings: 'id',
    });
    this.on('populate', () => seed(this));
  }
}
export const db = new LearningDatabase();
const now = Date.now();
async function seed(database: LearningDatabase) {
  const path: LearningPath = {
    id: 'staff-frontend',
    title: 'Staff Frontend',
    description: 'Build durable frontend systems, technical judgment, and interview confidence.',
    icon: 'Code2',
    color: '#83e377',
    targetRoles: ['Frontend Engineer', 'Full Stack Engineer', 'Software Architect'],
    minimumLevel: 'Senior',
    maximumLevel: 'Architect',
    createdAt: now,
  };
  const makeTopic = (
    id: string,
    parentId: string | null,
    title: string,
    order: number,
    description = ''
  ): Topic => ({
    id,
    learningPathId: path.id,
    parentId,
    title,
    description,
    order,
    status: id === 'hooks' ? 'learning' : 'not_started',
    needsRevision: id === 'closure',
    createdAt: now,
    updatedAt: now,
  });
  const topics = [
    makeTopic('javascript', null, 'JavaScript', 0, 'Language mechanics and runtime behavior.'),
    makeTopic(
      'closure',
      'javascript',
      'Closure',
      0,
      'Understand lexical scope and retained state.'
    ),
    makeTopic('promise', 'javascript', 'Promises', 1),
    makeTopic('event-loop', 'javascript', 'Event Loop', 2),
    makeTopic('react', null, 'React', 1, 'Rendering, scheduling, and composition.'),
    makeTopic('fiber', 'react', 'Fiber', 0),
    makeTopic('scheduler', 'react', 'Scheduler', 1),
    makeTopic('hooks', 'react', 'Hooks', 2, 'Build predictable stateful components.'),
    makeTopic('browser', null, 'Browser', 2),
    makeTopic('rendering', 'browser', 'Rendering Pipeline', 0),
    makeTopic('typescript', null, 'TypeScript', 3),
    makeTopic('generics', 'typescript', 'Generics', 0),
  ];
  await database.learningPaths.add(path);
  await database.topics.bulkAdd(topics);
  await database.notes.add({
    id: 'note-hooks',
    topicId: 'hooks',
    markdown:
      '# Hooks\n\nHooks let function components use **state**, effects, and reusable behavior.\n\n- Keep effects focused\n- Prefer derived values over mirrored state',
    updatedAt: now,
  });
  await database.snippets.add({
    id: 'snippet-hooks',
    topicId: 'hooks',
    filename: 'useDebounce.ts',
    language: 'typescript',
    code: "import { useEffect, useState } from 'react';\n\nexport function useDebounce<T>(value: T, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}",
    updatedAt: now,
  });
  await database.resources.add({
    id: 'resource-hooks',
    topicId: 'hooks',
    title: 'React: Reusing Logic with Custom Hooks',
    type: 'Documentation',
    url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
  });
  await database.settings.add({
    id: 'user',
    theme: 'dark',
    sidebarCollapsed: false,
    role: 'Frontend Engineer',
    level: 'Senior',
  });
}
export async function exportBackup(): Promise<Backup> {
  return {
    version: 1,
    exportedAt: Date.now(),
    learningPaths: await db.learningPaths.toArray(),
    topics: await db.topics.toArray(),
    notes: await db.notes.toArray(),
    snippets: await db.snippets.toArray(),
    resources: await db.resources.toArray(),
    recentTopics: await db.recentTopics.toArray(),
    settings: await db.settings.toArray(),
  };
}
export async function importBackup(value: unknown) {
  const backup = value as Partial<Backup>;
  if (
    backup.version !== 1 ||
    !Array.isArray(backup.learningPaths) ||
    !Array.isArray(backup.topics) ||
    !Array.isArray(backup.settings)
  )
    throw new Error('This is not a compatible Learning OS backup.');
  await db.transaction(
    'rw',
    [
      db.learningPaths,
      db.topics,
      db.notes,
      db.snippets,
      db.resources,
      db.recentTopics,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.learningPaths.clear(),
        db.topics.clear(),
        db.notes.clear(),
        db.snippets.clear(),
        db.resources.clear(),
        db.recentTopics.clear(),
        db.settings.clear(),
      ]);
      await db.learningPaths.bulkAdd(backup.learningPaths!);
      await db.topics.bulkAdd(backup.topics!);
      await db.notes.bulkAdd(backup.notes ?? []);
      await db.snippets.bulkAdd(backup.snippets ?? []);
      await db.resources.bulkAdd(backup.resources ?? []);
      await db.recentTopics.bulkAdd(backup.recentTopics ?? []);
      await db.settings.bulkAdd(backup.settings!);
    }
  );
}
export async function recordOpen(topicId: string) {
  await db.recentTopics.put({ topicId, openedAt: Date.now() });
  const overflow = (await db.recentTopics.orderBy('openedAt').reverse().toArray()).slice(12);
  await Promise.all(overflow.map((item) => db.recentTopics.delete(item.topicId)));
}
