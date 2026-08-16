import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Waypoints,
  Flame,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../db/database';
import {
  calculateOverview,
  calculateConsistency,
  calculatePathAnalytics,
  calculateWeakAreas,
  calculateRevisionMetrics,
  calculateReadinessMetrics,
  seedMockHistory,
  getRangeDates,
} from '../../utils/analytics';
import { leafTopics } from '../../utils/progress';
import type { AnalyticsSnapshot, Topic } from '../../models/types';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [selectedPathId, setSelectedPathId] = useState<string>('all');
  const [seeding, setSeeding] = useState(false);

  const data = useLiveQuery(async () => {
    const paths = await db.learningPaths.toArray();
    const topics = await db.topics.toArray();
    const activities = await db.learningActivities.toArray();
    const snapshots = await db.analyticsSnapshots.toArray();
    const settings = await db.settings.get('user');

    return { paths, topics, activities, snapshots, settings };
  });

  if (!data) return <div className="page-loading">Generating your insights…</div>;

  const { paths, topics, activities, snapshots } = data;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedMockHistory();
      alert('Mock study history successfully generated!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error generating history.');
    } finally {
      setSeeding(false);
    }
  };

  // Check if we have enough snapshots or activity logs
  const hasData = snapshots.length > 0 || activities.length > 0;

  if (!hasData) {
    return (
      <section className="page analytics-page">
        <div className="page-title">
          <div>
            <p className="eyebrow">LEARNING INTELLIGENCE</p>
            <h1>Learning Analytics</h1>
            <p>Understand your learning progress, consistency, revision behavior and interview readiness.</p>
          </div>
        </div>
        <div className="empty-analytics-card">
          <TrendingUp size={48} className="empty-icon" />
          <h2>Not enough learning data yet</h2>
          <p>
            Start completing, practicing, and revising topics. As soon as you log study activity, your analytics trend lines, streaks, and focus metrics will automatically appear here.
          </p>
          <div className="empty-actions">
            <Link className="button primary" to="/explorer">
              Explore Learning Paths <ArrowRight size={16} />
            </Link>
            <button className="button secondary" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Generating...' : 'Seed Mock Study History (for demo)'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 1. Calculate stats
  const overview = calculateOverview(timeRange, selectedPathId, topics, paths, activities, snapshots);
  const consistency = calculateConsistency(timeRange, activities);
  const pathStats = calculatePathAnalytics(timeRange, paths, topics, snapshots);
  const weakAreas = calculateWeakAreas(topics, paths).slice(0, 3); // show top 3 weak paths
  const revision = calculateRevisionMetrics(timeRange, selectedPathId, topics, paths, activities);
  const readiness = calculateReadinessMetrics(selectedPathId, topics, paths);

  // 2. Filter snapshots for the range chart
  const rangeDates = getRangeDates(timeRange);
  const rangeDatesSet = new Set(rangeDates);
  const filteredSnapshots = snapshots
    .filter(s => s.learningPathId === selectedPathId && rangeDatesSet.has(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. Render helper for Progress trend SVG Chart
  const renderProgressChart = (snaps: AnalyticsSnapshot[]) => {
    if (snaps.length < 2) {
      return (
        <div className="chart-empty-state">
          <p>Not enough history data in the selected period to draw progress trend.</p>
        </div>
      );
    }
    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 25;

    const points = snaps.map((snap, i) => {
      const x = paddingX + (i / (snaps.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (snap.overallProgress / 100) * (height - 2 * paddingY);
      return { x, y, progress: snap.overallProgress, date: snap.date };
    });

    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Y Axis Grid Lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
            return (
              <g key={val} className="grid-line">
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{val}%</text>
              </g>
            );
          })}
          {/* Fill Area */}
          <path d={areaD} fill="url(#chartGrad)" />
          {/* Progress Line */}
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* X Axis Labels */}
          {points.length > 0 && [0, Math.floor(points.length / 2), points.length - 1].map(idx => {
            if (idx >= points.length) return null;
            const p = points[idx];
            const date = new Date(p.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <text key={idx} x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">
                {dateStr}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Status Distribution percentages
  const scopeTopics = selectedPathId === 'all' ? topics : topics.filter(t => t.learningPathId === selectedPathId);
  const scopeLeaves = leafTopics(scopeTopics);
  const leavesCount = scopeLeaves.length || 1;
  const dist = {
    not_started: Math.round((scopeLeaves.filter(t => t.status === 'not_started').length / leavesCount) * 100),
    learning: Math.round((scopeLeaves.filter(t => t.status === 'learning').length / leavesCount) * 100),
    practiced: Math.round((scopeLeaves.filter(t => t.status === 'practiced').length / leavesCount) * 100),
    revised: Math.round((scopeLeaves.filter(t => t.status === 'revised').length / leavesCount) * 100),
    interview_ready: Math.round((scopeLeaves.filter(t => t.status === 'interview_ready').length / leavesCount) * 100),
  };

  // Streak Week Grid
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const renderWeeklyConsistency = () => {
    const today = new Date();
    return (
      <div className="consistency-week-row">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dateStr = d.toISOString().slice(0, 10);
          const active = consistency.activeDates.has(dateStr);
          return (
            <div key={i} className={`week-day-box ${active ? 'active' : ''}`}>
              <span className="box-day">{weekDays[d.getDay()]}</span>
              <span className="box-indicator" />
            </div>
          );
        })}
      </div>
    );
  };

  // Recent Actions
  const recentTopics = [...topics]
    .filter(t => t.status !== 'not_started')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  const getRecentActionLabel = (topic: Topic) => {
    const date = new Date(topic.updatedAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    let statusClean = topic.status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    if (topic.needsRevision) statusClean += ' (Revision Needed)';
    
    return {
      title: topic.title,
      id: topic.id,
      dateStr,
      statusLabel: statusClean,
    };
  };

  return (
    <section className="page analytics-page">
      {/* 1. Header controls */}
      <div className="analytics-header">
        <div>
          <p className="eyebrow">LEARNING INTELLIGENCE</p>
          <h1>Learning Analytics</h1>
          <p className="subtitle">Understand your learning progress, consistency, revision behavior and interview readiness.</p>
        </div>
        <div className="analytics-controls">
          <div className="filter-group">
            <label htmlFor="path-select" className="sr-only">Learning Path</label>
            <select
              id="path-select"
              value={selectedPathId}
              onChange={e => setSelectedPathId(e.target.value)}
            >
              <option value="all">All Learning Paths</option>
              {paths.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="range-selector">
            {(['7', '30', '90', 'all'] as const).map(r => (
              <button
                key={r}
                className={`range-btn ${timeRange === r ? 'active' : ''}`}
                onClick={() => setTimeRange(r)}
              >
                {r === 'all' ? 'All Time' : `${r} Days`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Overview Metrics */}
      <div className="analytics-metrics-grid">
        <article className="metric-card">
          <span className="card-label">Total Topics</span>
          <span className="metric-value">{overview.totalTopics}</span>
          <p>Actionable leaf topics in scope</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Completion</span>
          <span className="metric-value">{overview.overallProgress}%</span>
          <div className="meter micro-meter">
            <span style={{ width: `${overview.overallProgress}%` }} />
          </div>
        </article>
        <article className="metric-card">
          <span className="card-label">Topics Completed</span>
          <span className="metric-value">{overview.topicsCompleted}</span>
          <p>Marked Interview Ready</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Topics Practiced</span>
          <span className="metric-value">{overview.topicsPracticed}</span>
          <p>Reached Practiced state or higher</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Revision Rate</span>
          <span className="metric-value">{overview.revisionRate}%</span>
          <p>Of learned/practiced topics revised</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Learning Velocity</span>
          <span className="metric-value">{overview.velocityCount}</span>
          <p className="velocity-trend">
            {overview.velocityChange !== null ? (
              <span className={overview.velocityChange >= 0 ? 'trend-up' : 'trend-down'}>
                {overview.velocityChange >= 0 ? '↑' : '↓'} {Math.abs(overview.velocityChange)}%
              </span>
            ) : (
              <span className="trend-insufficient">Insufficient data</span>
            )}
            {' '} vs previous period
          </p>
        </article>
      </div>

      {/* Main Analytics Layout: Left Side (Trend/Consistency/Paths), Right Side (Weak Areas/Readiness/Revision) */}
      <div className="analytics-two-columns">
        <div className="analytics-left-column">
          {/* 3. Progress Trend */}
          <section className="panel chart-panel">
            <div className="panel-heading">
              <h2>Progress Trend</h2>
              <span>Learning path progress over time</span>
            </div>
            {renderProgressChart(filteredSnapshots)}
          </section>

          {/* 4. Learning Consistency */}
          <section className="panel consistency-panel">
            <div className="panel-heading">
              <h2>Learning Consistency</h2>
              <span>Active study habits & streak indicators</span>
            </div>
            <div className="consistency-grid-wrapper">
              <div className="streak-stats">
                <div className="streak-stat-box">
                  <Flame className="streak-icon" />
                  <div>
                    <span className="streak-num">{consistency.currentStreak}</span>
                    <span className="streak-lbl">Current Streak</span>
                  </div>
                </div>
                <div className="streak-stat-box">
                  <Award className="streak-icon" />
                  <div>
                    <span className="streak-num">{consistency.longestStreak}</span>
                    <span className="streak-lbl">Longest Streak</span>
                  </div>
                </div>
                <div className="streak-stat-box">
                  <Calendar className="streak-icon" />
                  <div>
                    <span className="streak-num">{consistency.averageActiveDaysPerWeek}d</span>
                    <span className="streak-lbl">Avg. active days / week</span>
                  </div>
                </div>
              </div>
              <div className="weekly-habit">
                <h3>Last 7 Days Activity</h3>
                {renderWeeklyConsistency()}
              </div>
            </div>
          </section>

          {/* 5. Status Distribution */}
          <section className="panel distribution-panel">
            <div className="panel-heading">
              <h2>Status Distribution</h2>
              <span>Current breakdown of topic learning states</span>
            </div>
            <div className="distribution-meter-wrapper">
              <div className="segmented-progress-bar">
                <span className="segment not-started" style={{ width: `${dist.not_started}%` }} />
                <span className="segment learning" style={{ width: `${dist.learning}%` }} />
                <span className="segment practiced" style={{ width: `${dist.practiced}%` }} />
                <span className="segment revised" style={{ width: `${dist.revised}%` }} />
                <span className="segment interview-ready" style={{ width: `${dist.interview_ready}%` }} />
              </div>
              <div className="distribution-legend">
                <div className="legend-item"><span className="dot not-started" /> Not Started ({dist.not_started}%)</div>
                <div className="legend-item"><span className="dot learning" /> Learning ({dist.learning}%)</div>
                <div className="legend-item"><span className="dot practiced" /> Practiced ({dist.practiced}%)</div>
                <div className="legend-item"><span className="dot revised" /> Revised ({dist.revised}%)</div>
                <div className="legend-item"><span className="dot interview-ready" /> Interview Ready ({dist.interview_ready}%)</div>
              </div>
            </div>
          </section>

          {/* 6. Learning Path Comparison */}
          <section className="panel path-performance-panel">
            <div className="panel-heading">
              <h2>Learning Path Performance</h2>
            </div>
            <div className="path-stats-list">
              {pathStats.map(p => (
                <div key={p.id} className="path-stat-row">
                  <div className="path-row-header">
                    <span className="path-dot" style={{ background: p.color }} />
                    <span className="path-title">{p.title}</span>
                    <span className="path-progress-pct">{p.progress}%</span>
                  </div>
                  <div className="meter">
                    <span style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                  <div className="path-row-details">
                    <span>{p.totalTopics} leaf topics</span>
                    <span>{p.interviewReadyCount} completed</span>
                    <span>{p.revisionNeededCount} revisions</span>
                    <span className={`change-indicator ${p.progressChange >= 0 ? 'positive' : 'negative'}`}>
                      {p.progressChange >= 0 ? `+${p.progressChange}%` : `${p.progressChange}%`} this period
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="analytics-right-column">
          {/* 7. Areas Needing Attention (Weak Areas) */}
          <section className="panel weak-areas-panel">
            <div className="panel-heading">
              <h2>Areas Needing Attention</h2>
              <span>Prioritized based on revision backlogs and completion rates</span>
            </div>
            {weakAreas.length > 0 ? (
              <div className="weak-areas-list">
                {weakAreas.map(w => (
                  <article key={w.pathId} className="weak-area-card">
                    <div className="weak-card-header">
                      <AlertTriangle className="warn-icon" />
                      <h3>{w.pathTitle}</h3>
                    </div>
                    <div className="weak-card-stats">
                      <div>
                        <span>{w.progress}%</span>
                        <small>Progress</small>
                      </div>
                      <div>
                        <span>{w.revisionNeededCount}</span>
                        <small>Need Revision</small>
                      </div>
                      <div>
                        <span>{w.interviewReadyPercent}%</span>
                        <small>Interview Ready</small>
                      </div>
                    </div>
                    <p className="weak-recommendation">
                      <strong>Recommendation:</strong> {w.recommendation}
                    </p>
                    <Link className="button small primary" to={`/explorer?path=${w.pathId}`}>
                      Explore <ChevronRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No weak areas identified. Good work!</p>
            )}
          </section>

          {/* 8. Interview Readiness */}
          <section className="panel readiness-panel">
            <div className="panel-heading">
              <h2>Interview Readiness</h2>
              <span>Derivation from topics marked Interview Ready</span>
            </div>
            <div className="readiness-metrics-wrapper">
              <div className="readiness-overall">
                <span className="readiness-num">{readiness.overallReadiness}%</span>
                <span className="readiness-lbl">Overall readiness level</span>
              </div>
              <div className="path-breakdown-list">
                {readiness.pathBreakdown.map(p => (
                  <div key={p.pathTitle} className="breakdown-row">
                    <span className="breakdown-name">{p.pathTitle}</span>
                    <div className="mini-progress-bar">
                      <div className="bar-fill" style={{ width: `${p.rate}%` }} />
                    </div>
                    <span className="breakdown-value">{p.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 9. Revision Analytics */}
          <section className="panel revision-analytics-panel">
            <div className="panel-heading">
              <h2>Revision Analytics</h2>
            </div>
            <div className="revision-metrics-summary">
              <div className="revision-summary-item">
                <span>{revision.topicsRequiringRevision}</span>
                <small>Requires revision</small>
              </div>
              <div className="revision-summary-item">
                <span>{revision.topicsRevisedThisPeriod}</span>
                <small>Revised this period</small>
              </div>
              <div className="revision-summary-item">
                <span>{revision.revisionCompletionRate}%</span>
                <small>Completion rate</small>
              </div>
            </div>
            <div className="path-breakdown-list border-top">
              <h3 className="section-subtitle">Revision Rate by Path</h3>
              {revision.pathBreakdown.map(p => (
                <div key={p.pathTitle} className="breakdown-row">
                  <span className="breakdown-name">{p.pathTitle}</span>
                  <div className="mini-progress-bar">
                    <div className="bar-fill revision-bar" style={{ width: `${p.rate}%` }} />
                  </div>
                  <span className="breakdown-value">{p.rate}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* 10. Recent Learning Activity */}
          <section className="panel recent-activity-panel">
            <div className="panel-heading">
              <h2>Recent Activity</h2>
              <span>Track recent progress updates</span>
            </div>
            {recentTopics.length > 0 ? (
              <div className="recent-activity-list">
                {recentTopics.map(t => {
                  const act = getRecentActionLabel(t);
                  return (
                    <Link key={t.id} to={`/topics/${act.id}`} className="activity-item">
                      <div className="item-meta">
                        <CheckCircle size={14} className="check-icon" />
                        <strong>{act.title}</strong>
                      </div>
                      <div className="item-details">
                        <span className="activity-status-label">{act.statusLabel}</span>
                        <span className="activity-date">{act.dateStr}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="empty-copy">No recent activities log. Open a topic to start.</p>
            )}
          </section>

          {/* Seeding Utilities for testing / reset */}
          <div className="demo-reset-container">
            <button className="button secondary small" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Generating mock history...' : 'Regenerate Mock Study History (Demo)'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
