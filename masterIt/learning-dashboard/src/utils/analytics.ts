import { db } from '../db/database';
import type { Topic, LearningPath, AnalyticsSnapshot, LearningActivity } from '../models/types';
import { progressOf, leafTopics } from './progress';

export interface OverviewStats {
  totalTopics: number;
  overallProgress: number;
  topicsCompleted: number;
  topicsPracticed: number;
  revisionRate: number;
  velocityCount: number;
  velocityChange: number | null; // null represents insufficient data
}

export interface ConsistencyStats {
  activeDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  averageActiveDaysPerWeek: number;
  activeDates: Set<string>;
}

export interface PathAnalytics {
  id: string;
  title: string;
  color: string;
  progress: number;
  totalTopics: number;
  interviewReadyCount: number;
  revisionNeededCount: number;
  progressChange: number; // change during selected period
}

export interface WeakAreaInfo {
  pathId: string;
  pathTitle: string;
  progress: number;
  revisionNeededCount: number;
  interviewReadyPercent: number;
  recommendation: string;
}

export interface RevisionStats {
  topicsRequiringRevision: number;
  topicsRevisedThisPeriod: number;
  revisionCompletionRate: number;
  pathBreakdown: { pathTitle: string; rate: number }[];
}

export interface ReadinessStats {
  overallReadiness: number;
  pathBreakdown: { pathTitle: string; rate: number }[];
}

// Helper to get array of YYYY-MM-DD strings for a given time range
export function getRangeDates(range: '7' | '30' | '90' | 'all', referenceDate = new Date()): string[] {
  const dates: string[] = [];
  const today = new Date(referenceDate);
  
  let days = 7;
  if (range === '30') days = 30;
  if (range === '90') days = 90;
  if (range === 'all') days = 365; // fallback to up to 1 year of history if "all"

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function calculateOverview(
  timeRange: '7' | '30' | '90' | 'all',
  pathId: string,
  topics: Topic[],
  paths: LearningPath[],
  activities: LearningActivity[],
  snapshots: AnalyticsSnapshot[]
): OverviewStats {
  // 1. Filter topics in scope
  const scopeTopics = pathId === 'all' ? topics : topics.filter(t => t.learningPathId === pathId);
  const scopeLeaves = leafTopics(scopeTopics);

  const totalTopics = scopeLeaves.length;
  const overallProgress = progressOf(scopeTopics);
  const topicsCompleted = scopeLeaves.filter(t => t.status === 'interview_ready').length;
  const topicsPracticed = scopeLeaves.filter(t =>
    ['practiced', 'revised', 'interview_ready'].includes(t.status)
  ).length;

  // 2. Revision Rate: percentage of practiced/learned topics that have been revised (revised or interview_ready)
  const practicedOrMore = scopeLeaves.filter(t =>
    ['practiced', 'revised', 'interview_ready'].includes(t.status)
  );
  const revisedOrMore = practicedOrMore.filter(t =>
    ['revised', 'interview_ready'].includes(t.status)
  );
  const revisionRate = practicedOrMore.length
    ? Math.round((revisedOrMore.length / practicedOrMore.length) * 100)
    : 0;

  // 3. Learning Velocity: topics progressed inside the selected period
  // We determine date ranges
  const rangeDays = timeRange === '7' ? 7 : timeRange === '30' ? 30 : timeRange === '90' ? 90 : 365;
  const dates = getRangeDates(timeRange);
  const currentPeriodSet = new Set(dates);

  // If timeRange is 'all', previous period is not defined
  const showComparison = timeRange !== 'all';
  const prevDates = showComparison ? getRangeDates(timeRange, new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)) : [];
  const prevPeriodSet = new Set(prevDates);

  // Filter activities
  const currentActivities = activities.filter(a => currentPeriodSet.has(a.date));
  const prevActivities = activities.filter(a => prevPeriodSet.has(a.date));

  // Progression is status updates moving forward: topicsPracticed + topicsRevised + topicsCompleted
  const getProgressions = (acts: LearningActivity[]) =>
    acts.reduce((sum, a) => sum + (a.topicsPracticed || 0) + (a.topicsRevised || 0) + (a.topicsCompleted || 0), 0);

  const velocityCount = getProgressions(currentActivities);
  let velocityChange: number | null = null;

  if (showComparison && activities.length > 0) {
    const prevCount = getProgressions(prevActivities);
    if (prevCount > 0) {
      velocityChange = Math.round(((velocityCount - prevCount) / prevCount) * 100);
    } else if (velocityCount > 0) {
      velocityChange = 100; // 100% increase if previous was 0 and current is positive
    } else {
      velocityChange = 0;
    }
  }

  return {
    totalTopics,
    overallProgress,
    topicsCompleted,
    topicsPracticed,
    revisionRate,
    velocityCount,
    velocityChange,
  };
}

export function calculateConsistency(
  timeRange: '7' | '30' | '90' | 'all',
  activities: LearningActivity[]
): ConsistencyStats {
  const dates = getRangeDates(timeRange);
  const periodSet = new Set(dates);

  // Active days: topicsUpdated > 0 || notesUpdated > 0 || snippetsUpdated > 0
  const activeActivities = activities.filter(
    a => (a.topicsUpdated || 0) + (a.notesUpdated || 0) + (a.snippetsUpdated || 0) > 0
  );
  
  const currentPeriodActive = activeActivities.filter(a => periodSet.has(a.date));
  const activeDaysCount = currentPeriodActive.length;

  const totalDays = timeRange === 'all' && activities.length ? Math.max(dates.length, activities.length) : dates.length;
  const averageActiveDaysPerWeek = Math.min(7, parseFloat(((activeDaysCount / totalDays) * 7).toFixed(1)));

  // Streak calculations (based on ALL activities in DB to ensure streaks remain accurate)
  const activeDates = new Set(activeActivities.map(a => a.date));
  const sortedDates = Array.from(activeDates).sort();

  let currentStreak = 0;
  let longestStreak = 0;

  if (sortedDates.length > 0) {
    // 1. Longest Streak
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const currentDate = new Date(dStr);
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = currentDate;
    }

    // 2. Current Streak
    // Start counting backwards from today
    const today = new Date();
    let checkDate = new Date(today);
    
    // Check today or yesterday
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (activeDates.has(todayStr) || activeDates.has(yesterdayStr)) {
      if (activeDates.has(yesterdayStr) && !activeDates.has(todayStr)) {
        checkDate = yesterday;
      }
      while (true) {
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (activeDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  return {
    activeDaysCount,
    currentStreak,
    longestStreak,
    averageActiveDaysPerWeek,
    activeDates,
  };
}

export function calculatePathAnalytics(
  timeRange: '7' | '30' | '90' | 'all',
  paths: LearningPath[],
  topics: Topic[],
  snapshots: AnalyticsSnapshot[]
): PathAnalytics[] {
  const rangeDates = getRangeDates(timeRange);
  const oldestDate = rangeDates[0];
  const todayStr = rangeDates[rangeDates.length - 1];

  return paths.map(path => {
    const pathTopics = topics.filter(t => t.learningPathId === path.id);
    const leaves = leafTopics(pathTopics);
    const progress = progressOf(pathTopics);
    const interviewReadyCount = leaves.filter(t => t.status === 'interview_ready').length;
    const revisionNeededCount = pathTopics.filter(t => t.needsRevision).length;

    // Calculate progressChange
    // Query snapshots for path
    const pathSnaps = snapshots.filter(s => s.learningPathId === path.id);
    
    // Find snapshot closest to start of period
    const startSnap = pathSnaps
      .filter(s => s.date <= oldestDate)
      .sort((a, b) => b.date.localeCompare(a.date))[0] || 
      pathSnaps.sort((a, b) => a.date.localeCompare(b.date))[0]; // fallback to oldest available

    const progressChange = startSnap ? progress - startSnap.overallProgress : 0;

    return {
      id: path.id,
      title: path.title,
      color: path.color,
      progress,
      totalTopics: leaves.length,
      interviewReadyCount,
      revisionNeededCount,
      progressChange,
    };
  });
}

export function calculateWeakAreas(topics: Topic[], paths: LearningPath[]): WeakAreaInfo[] {
  const results: WeakAreaInfo[] = [];

  for (const path of paths) {
    const pathTopics = topics.filter(t => t.learningPathId === path.id);
    const leaves = leafTopics(pathTopics);
    if (leaves.length === 0) continue;

    const progress = progressOf(pathTopics);
    const revisionNeededCount = pathTopics.filter(t => t.needsRevision).length;
    const interviewReadyCount = leaves.filter(t => t.status === 'interview_ready').length;
    const interviewReadyPercent = Math.round((interviewReadyCount / leaves.length) * 100);

    // Calculate weakness score:
    // (100 - progress) * 0.4 + (revisionCount * 12) + (100 - interviewReadyPercent) * 0.4
    const score = (100 - progress) * 0.4 + (revisionNeededCount * 12) + (100 - interviewReadyPercent) * 0.4;

    // Generate recommendation
    let recommendation = '';
    const pendingRevision = pathTopics.filter(t => t.needsRevision);
    const notStarted = leaves.filter(t => t.status === 'not_started');
    const inProgress = leaves.filter(t => t.status === 'learning');

    if (pendingRevision.length > 0) {
      recommendation = `Queue has ${pendingRevision.length} topics needing revision. Focus on revising "${pendingRevision[0].title}".`;
    } else if (inProgress.length > 0) {
      recommendation = `You have topics in progress. Resume learning "${inProgress[0].title}" to build momentum.`;
    } else if (notStarted.length > 0) {
      recommendation = `Start new topics in this path. Explore "${notStarted[0].title}" next.`;
    } else {
      recommendation = `Bring practiced topics to Interview Ready level. Review intermediate items.`;
    }

    results.push({
      pathId: path.id,
      pathTitle: path.title,
      progress,
      revisionNeededCount,
      interviewReadyPercent,
      recommendation,
      // hidden score for sorting
      ...({ score } as any)
    });
  }

  // Sort by score descending (highest weakness score = needs most attention)
  return results.sort((a: any, b: any) => b.score - a.score);
}

export function calculateRevisionMetrics(
  timeRange: '7' | '30' | '90' | 'all',
  pathId: string,
  topics: Topic[],
  paths: LearningPath[],
  activities: LearningActivity[]
): RevisionStats {
  const scopeTopics = pathId === 'all' ? topics : topics.filter(t => t.learningPathId === pathId);
  const scopeLeaves = leafTopics(scopeTopics);

  const topicsRequiringRevision = scopeTopics.filter(t => t.needsRevision).length;

  // Filter activities in period
  const dates = getRangeDates(timeRange);
  const periodSet = new Set(dates);
  const periodActivities = activities.filter(a => periodSet.has(a.date));
  const topicsRevisedThisPeriod = periodActivities.reduce((sum, a) => sum + (a.topicsRevised || 0), 0);

  // Revision completion rate: percentage of leaves that are revised/completed vs those in progress
  const revisedCount = scopeLeaves.filter(t => ['revised', 'interview_ready'].includes(t.status)).length;
  const practicedCount = scopeLeaves.filter(t => ['practiced', 'revised', 'interview_ready'].includes(t.status)).length;
  const revisionCompletionRate = practicedCount > 0 ? Math.round((revisedCount / practicedCount) * 100) : 0;

  // Path breakdown
  const pathBreakdown = paths.map(p => {
    const pTopics = topics.filter(t => t.learningPathId === p.id);
    const pLeaves = leafTopics(pTopics);
    const pRevised = pLeaves.filter(t => ['revised', 'interview_ready'].includes(t.status)).length;
    const pPracticed = pLeaves.filter(t => ['practiced', 'revised', 'interview_ready'].includes(t.status)).length;
    return {
      pathTitle: p.title,
      rate: pPracticed > 0 ? Math.round((pRevised / pPracticed) * 100) : 0
    };
  });

  return {
    topicsRequiringRevision,
    topicsRevisedThisPeriod,
    revisionCompletionRate,
    pathBreakdown
  };
}

export function calculateReadinessMetrics(
  pathId: string,
  topics: Topic[],
  paths: LearningPath[]
): ReadinessStats {
  const scopeTopics = pathId === 'all' ? topics : topics.filter(t => t.learningPathId === pathId);
  const scopeLeaves = leafTopics(scopeTopics);

  const totalLeaves = scopeLeaves.length;
  const readyCount = scopeLeaves.filter(t => t.status === 'interview_ready').length;
  const overallReadiness = totalLeaves > 0 ? Math.round((readyCount / totalLeaves) * 100) : 0;

  const pathBreakdown = paths.map(p => {
    const pTopics = topics.filter(t => t.learningPathId === p.id);
    const pLeaves = leafTopics(pTopics);
    const pReady = pLeaves.filter(t => t.status === 'interview_ready').length;
    return {
      pathTitle: p.title,
      rate: pLeaves.length > 0 ? Math.round((pReady / pLeaves.length) * 100) : 0
    };
  });

  return {
    overallReadiness,
    pathBreakdown
  };
}

// Seeds 60 days of mock snapshots and learning activity records
export async function seedMockHistory() {
  const paths = await db.learningPaths.toArray();
  if (paths.length === 0) {
    throw new Error('Please open at least one learning path to initialize data first.');
  }

  // Clear existing snapshots and activities
  await db.analyticsSnapshots.clear();
  await db.learningActivities.clear();

  const now = new Date();
  const snapshots: AnalyticsSnapshot[] = [];
  const activities: LearningActivity[] = [];

  for (let i = 60; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Progression goes from 10% to 75%
    const baseProgress = Math.round(10 + (65 * (60 - i)) / 60 + Math.sin((60 - i) * 0.25) * 6);
    const totalTopics = 38;

    const interviewReady = Math.max(0, Math.round((baseProgress / 100) * totalTopics * 0.45));
    const revised = Math.max(0, Math.round((baseProgress / 100) * totalTopics * 0.3));
    const practiced = Math.max(0, Math.round((baseProgress / 100) * totalTopics * 0.15));
    const learning = Math.max(0, Math.round(((100 - baseProgress) / 100) * totalTopics * 0.4));
    const notStarted = Math.max(0, totalTopics - (interviewReady + revised + practiced + learning));

    snapshots.push({
      date: dateStr,
      learningPathId: 'all',
      overallProgress: Math.min(100, baseProgress),
      totalTopics,
      notStarted,
      learning,
      practiced,
      revised,
      interviewReady,
      topicsInProgress: learning,
      topicsNeedingRevision: Math.max(0, Math.round(revised * 0.15)),
      learningPathsCount: paths.length,
    });

    for (const path of paths) {
      const pathOffset = path.id === 'staff-frontend' ? 8 : -8;
      const pathProgress = Math.max(0, Math.min(100, baseProgress + pathOffset));
      const pathTotal = path.id === 'staff-frontend' ? 12 : 26;

      const pReady = Math.max(0, Math.round((pathProgress / 100) * pathTotal * 0.45));
      const pRevised = Math.max(0, Math.round((pathProgress / 100) * pathTotal * 0.3));
      const pPracticed = Math.max(0, Math.round((pathProgress / 100) * pathTotal * 0.15));
      const pLearning = Math.max(0, Math.round(((100 - pathProgress) / 100) * pathTotal * 0.4));
      const pNotStarted = Math.max(0, pathTotal - (pReady + pRevised + pPracticed + pLearning));

      snapshots.push({
        date: dateStr,
        learningPathId: path.id,
        overallProgress: pathProgress,
        totalTopics: pathTotal,
        notStarted: pNotStarted,
        learning: pLearning,
        practiced: pPracticed,
        revised: pRevised,
        interviewReady: pReady,
        topicsInProgress: pLearning,
        topicsNeedingRevision: Math.max(0, Math.round(pRevised * 0.15)),
        learningPathsCount: 1,
      });
    }

    // Activity: Active on most weekdays, off on most weekends
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isActive = isWeekend ? Math.random() > 0.8 : Math.random() > 0.3;

    if (isActive) {
      activities.push({
        date: dateStr,
        topicsUpdated: Math.floor(Math.random() * 3) + 1,
        topicsPracticed: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 1 : 0,
        topicsRevised: Math.random() > 0.6 ? 1 : 0,
        topicsCompleted: Math.random() > 0.85 ? 1 : 0,
        notesUpdated: Math.random() > 0.45 ? 1 : 0,
        snippetsUpdated: Math.random() > 0.5 ? 1 : 0,
      });
    }
  }

  await db.transaction('rw', [db.analyticsSnapshots, db.learningActivities], async () => {
    await db.analyticsSnapshots.bulkAdd(snapshots);
    await db.learningActivities.bulkAdd(activities);
  });
}
