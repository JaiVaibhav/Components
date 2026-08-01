import { ArrowRight, BookOpen, BrainCircuit, Clock3, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { LEVELS, statusLabel } from '../../models/types';
import { pathMatches, progressOf } from '../../utils/progress';

const ProgressRing = ({ value }: { value: number }) => (
  <div
    className="progress-ring"
    style={{ background: `conic-gradient(var(--accent) ${value * 3.6}deg, var(--border) 0deg)` }}
  >
    <span>{value}%</span>
  </div>
);
export default function Dashboard() {
  const data = useLiveQuery(async () => ({
    paths: await db.learningPaths.toArray(),
    topics: await db.topics.toArray(),
    recents: await db.recentTopics.orderBy('openedAt').reverse().toArray(),
    settings: await db.settings.get('user'),
  }));
  if (!data) return <div className="page-loading">Opening your dashboard…</div>;
  const filteredPaths = data.paths.filter((path) =>
    pathMatches(path, data.settings!.role, data.settings!.level, LEVELS)
  );
  const scope = filteredPaths.length
    ? data.topics.filter((topic) => filteredPaths.some((path) => path.id === topic.learningPathId))
    : data.topics;
  const overall = progressOf(scope);
  const learning = scope.filter((topic) => topic.status === 'learning');
  const revision = scope.filter((topic) => topic.needsRevision);
  const recent = data.recents
    .map((recent) => scope.find((topic) => topic.id === recent.topicId))
    .filter(Boolean)
    .slice(0, 4);
  return (
    <section className="page dashboard">
      <div className="page-title">
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h1>Good to see you.</h1>
          <p>Keep momentum with one focused learning session.</p>
        </div>
        <Link className="button primary" to="/explorer">
          Explore paths <ArrowRight size={16} />
        </Link>
      </div>
      <div className="stats-grid">
        <article className="overall-card">
          <div>
            <span className="card-label">Overall progress</span>
            <h2>{overall}%</h2>
            <p>Across your matching learning paths</p>
          </div>
          <ProgressRing value={overall} />
        </article>
        <article className="stat-card">
          <BookOpen />
          <span>{learning.length}</span>
          <p>Topics in progress</p>
        </article>
        <article className="stat-card">
          <RotateCcw />
          <span>{revision.length}</span>
          <p>Need revision</p>
        </article>
        <article className="stat-card">
          <BrainCircuit />
          <span>{data.paths.length}</span>
          <p>Learning paths</p>
        </article>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main-column">
          <section className="panel continue-panel">
            <div className="panel-title">
              <div>
                <span className="card-label">CONTINUE LEARNING</span>
                <h2>{learning[0]?.title ?? 'Choose your next topic'}</h2>
                <p>
                  {learning[0]?.description ||
                    'Open a learning path and start building your roadmap.'}
                </p>
              </div>
              <Clock3 />
            </div>
            {learning[0] ? (
              <Link className="button primary" to={`/topics/${learning[0].id}`}>
                Resume learning <ArrowRight size={16} />
              </Link>
            ) : (
              <Link className="button primary" to="/explorer">
                Browse paths <ArrowRight size={16} />
              </Link>
            )}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Learning paths</h2>
              <Link to="/explorer">Manage paths</Link>
            </div>
            <div className="path-list">
              {data.paths.map((path) => {
                const value = progressOf(
                  data.topics.filter((topic) => topic.learningPathId === path.id)
                );
                return (
                  <Link to={`/explorer?path=${path.id}`} key={path.id}>
                    <span className="path-icon" style={{ background: path.color }}>
                      {path.icon.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{path.title}</strong>
                      <small>{path.targetRoles.join(' · ')}</small>
                      <div className="meter">
                        <span style={{ width: `${value}%` }} />
                      </div>
                    </div>
                    <b>{value}%</b>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="dashboard-side-column">
          <section className="panel">
            <div className="panel-heading">
              <h2>Topics needing revision</h2>
              <Link to="/explorer">View all</Link>
            </div>
            {revision.length ? (
              <div className="compact-list">
                {revision.slice(0, 4).map((topic) => (
                  <Link to={`/topics/${topic.id}`} key={topic.id}>
                    <span className="topic-dot" />
                    <div>
                      <strong>{topic.title}</strong>
                      <small>{statusLabel(topic.status)}</small>
                    </div>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-copy">
                Nothing queued. Mark a topic when you want to revisit it.
              </p>
            )}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Recently opened</h2>
            </div>
            {recent.length ? (
              <div className="compact-list">
                {recent.map(
                  (topic) =>
                    topic && (
                      <Link to={`/topics/${topic.id}`} key={topic.id}>
                        <span className="recent-icon">↗</span>
                        <div>
                          <strong>{topic.title}</strong>
                          <small>Open topic</small>
                        </div>
                        <ArrowRight size={15} />
                      </Link>
                    )
                )}
              </div>
            ) : (
              <p className="empty-copy">Topics you open will appear here.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
