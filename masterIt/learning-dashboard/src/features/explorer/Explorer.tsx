import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  IndentDecrease,
  IndentIncrease,
  MoreHorizontal,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../db/database';
import { LEVELS, type LearningPath, type Topic, uid } from '../../models/types';
import { progressOf } from '../../utils/progress';

const roles = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'System Designer',
  'Software Architect',
];
export default function Explorer() {
  const data = useLiveQuery(async () => ({
    paths: await db.learningPaths.toArray(),
    topics: await db.topics.toArray(),
  }));
  const [searchParams] = useSearchParams();
  const urlPathId = searchParams.get('path');

  const [showPathForm, setShowPathForm] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(urlPathId);
  const [expandedPathId, setExpandedPathId] = useState<string | null>(urlPathId);
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(!urlPathId);
  const helpDialogRef = useRef<HTMLDialogElement>(null);

  // Sync active path index with initial query param
  useEffect(() => {
    if (!data?.paths || !urlPathId) return;
    const idx = data.paths.findIndex((p) => p.id === urlPathId);
    if (idx !== -1) {
      const timer = setTimeout(() => {
        setActivePathIndex(idx);
        setExpandedPathId(urlPathId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [urlPathId, data?.paths]);

  // Slideshow interval
  useEffect(() => {
    if (!isAutoPlaying || !data?.paths || data.paths.length <= 1) return;
    const interval = setInterval(() => {
      setActivePathIndex((prevIndex) => (prevIndex + 1) % data.paths.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, data?.paths]);

  if (!data) return <div className="page-loading">Loading paths…</div>;

  const handleSelectPath = (pathId: string) => {
    setSelectedPathId(pathId);
    setExpandedPathId(pathId);
    setIsAutoPlaying(false);
    const idx = data.paths.findIndex((p) => p.id === pathId);
    if (idx !== -1) {
      setActivePathIndex(idx);
    }
  };

  const handleToggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
    if (!isAutoPlaying) {
      // If resuming, deselect explicit path selection to cycle
      setSelectedPathId(null);
    }
  };

  // Determine currently selected path or active path in slide
  const currentActivePath = data.paths[activePathIndex];

  return (
    <section className="page explorer-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">ROADMAP EXPLORER</p>
          <h1>Learning paths</h1>
          <p>Build paths for any discipline, role, or career stage.</p>
        </div>
        <div className="page-title-actions">
          <button className="button-link" onClick={() => helpDialogRef.current?.showModal()}>
            Learn More
          </button>
          <button className="button primary" onClick={() => setShowPathForm(true)}>
            <FolderPlus size={16} /> New path
          </button>
        </div>
      </div>
      {showPathForm && <PathForm close={() => setShowPathForm(false)} />}

      <div className="explorer-layout">
        <section className="panel tree-panel">
          <div className="panel-heading">
            <h2>Explorer</h2>
            <span>{data.paths.length} paths</span>
          </div>
          {data.paths.map((path) => (
            <PathTree
              key={path.id}
              path={path}
              topics={data.topics.filter((topic) => topic.learningPathId === path.id)}
              isSelected={
                selectedPathId === path.id || (!selectedPathId && currentActivePath?.id === path.id)
              }
              open={expandedPathId === path.id}
              onSelect={handleSelectPath}
              onToggle={() => setExpandedPathId(expandedPathId === path.id ? null : path.id)}
            />
          ))}
        </section>

        <aside className="panel progress-tracker-panel">
          <div className="tracker-header">
            <h2>Path Insights</h2>
            {data.paths.length > 1 && (
              <div className="tracker-controls">
                <button
                  className="icon-button"
                  aria-label={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
                  onClick={handleToggleAutoPlay}
                >
                  {isAutoPlaying ? <Pause size={15} /> : <Play size={15} />}
                </button>
              </div>
            )}
          </div>

          {data.paths.length === 0 ? (
            <div className="tracker-empty">Create a learning path to see insights.</div>
          ) : (
            <div className="tracker-slider-viewport">
              <div
                className="tracker-slider-track"
                style={{ transform: `translateX(-${activePathIndex * 100}%)` }}
              >
                {data.paths.map((path) => {
                  const pathTopics = data.topics.filter(
                    (topic) => topic.learningPathId === path.id
                  );
                  const total = pathTopics.length;
                  const progress = progressOf(pathTopics);
                  const statuses = [
                    { id: 'interview_ready', label: 'Interview Ready' },
                    { id: 'revised', label: 'Revised' },
                    { id: 'practiced', label: 'Practiced' },
                    { id: 'learning', label: 'In Progress' },
                    { id: 'not_started', label: 'Not Started' },
                  ] as const;

                  return (
                    <div key={path.id} className="tracker-slide">
                      <div className="tracker-path-info">
                        <span className="tree-path-icon" style={{ background: path.color }}>
                          {path.icon.slice(0, 1)}
                        </span>
                        <h3>{path.title}</h3>
                      </div>
                      <div className="status-progress-list">
                        {statuses.map((status) => {
                          const count =
                            status.id === 'revised'
                              ? pathTopics.filter((t) => t.needsRevision).length
                              : pathTopics.filter((t) => t.status === status.id).length;
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                          return (
                            <div key={status.id} className="status-progress-item">
                              <div className="status-progress-header">
                                <span className="status-name">
                                  <span className={`status-dot ${status.id}`} />
                                  {status.label}
                                </span>
                                <span className="status-stats">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="status-progress-bar">
                                <span className={status.id} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <div
                          key="overall"
                          className="status-progress-item"
                          style={{ marginTop: '4px' }}
                        >
                          <div className="status-progress-header">
                            <span className="status-name" style={{ fontWeight: '750' }}>
                              Overall Progress
                            </span>
                            <span
                              className="status-stats"
                              style={{ fontWeight: '750', color: 'var(--accent)' }}
                            >
                              {progress}%
                            </span>
                          </div>
                          <div className="status-progress-bar" style={{ height: '8px' }}>
                            <span
                              className="interview_ready"
                              style={{
                                width: `${progress}%`,
                                background: path.color,
                                boxShadow: `0 0 8px ${path.color}4c`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      <dialog ref={helpDialogRef} className="help-dialog">
        <span className="card-label">HOW IT WORKS</span>
        <h2>Make it yours</h2>
        <p>
          Paths are reusable roadmaps. Add child topics to model concepts, practices, and milestones
          at any depth.
        </p>
        <ul>
          <li>Progress is calculated from leaf topics.</li>
          <li>Use the role and level range to make paths discoverable.</li>
          <li>Open a topic to write notes and snippets.</li>
        </ul>
        <div className="dialog-footer">
          <button className="button primary" onClick={() => helpDialogRef.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </section>
  );
}
function PathForm({ close }: { close: () => void }) {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState(roles[0]);
  const [min, setMin] = useState('Fresher');
  const [max, setMax] = useState('Architect');
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await db.learningPaths.add({
      id: uid(),
      title: title.trim(),
      description: '',
      icon: 'Path',
      color: '#7dd3fc',
      targetRoles: [role],
      minimumLevel: min as LearningPath['minimumLevel'],
      maximumLevel: max as LearningPath['maximumLevel'],
      createdAt: Date.now(),
    });
    close();
  };
  return (
    <form className="inline-form" onSubmit={save}>
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Path name, e.g. Backend Foundations"
      />
      <select value={role} onChange={(event) => setRole(event.target.value)}>
        {roles.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <select value={min} onChange={(event) => setMin(event.target.value)}>
        {LEVELS.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <span>to</span>
      <select value={max} onChange={(event) => setMax(event.target.value)}>
        {LEVELS.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <button className="button primary">Create path</button>
      <button type="button" className="button ghost" onClick={close}>
        Cancel
      </button>
    </form>
  );
}
function PathTree({
  path,
  topics,
  isSelected,
  open,
  onSelect,
  onToggle,
}: {
  path: LearningPath;
  topics: Topic[];
  isSelected: boolean;
  open: boolean;
  onSelect: (pathId: string) => void;
  onToggle: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const roots = topics.filter((topic) => !topic.parentId).sort((a, b) => a.order - b.order);
  const progress = progressOf(topics);
  const totalCount = topics.length;
  const learningCount = topics.filter((t) => t.status === 'learning').length;
  const readyCount = topics.filter((t) => t.status === 'interview_ready').length;
  const revisionCount = topics.filter((t) => t.needsRevision).length;

  useEffect(() => {
    if (isSelected) {
      const timer = setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  const removePath = async () => {
    if (confirm(`Delete “${path.title}” and all of its content?`))
      await db.transaction(
        'rw',
        db.learningPaths,
        db.topics,
        db.notes,
        db.snippets,
        db.resources,
        async () => {
          const ids = topics.map((topic) => topic.id);
          await db.notes.where('topicId').anyOf(ids).delete();
          await db.snippets.where('topicId').anyOf(ids).delete();
          await db.resources.where('topicId').anyOf(ids).delete();
          await db.topics.bulkDelete(ids);
          await db.learningPaths.delete(path.id);
        }
      );
  };
  const rename = async () => {
    const title = prompt('Learning path name', path.title);
    if (title?.trim()) await db.learningPaths.update(path.id, { title: title.trim() });
  };
  return (
    <div ref={containerRef} className="path-tree">
      <div
        className={`tree-path ${isSelected ? 'selected' : ''}`}
        style={
          isSelected
            ? {
                borderColor: path.color,
                boxShadow: `0 0 8px ${path.color}40`,
                background: `linear-gradient(90deg, ${path.color}0d 0%, transparent 100%)`,
              }
            : undefined
        }
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.icon-button, .tree-actions')) return;
          onSelect(path.id);
          if (!open) {
            onToggle();
          }
        }}
      >
        <button className="icon-button" aria-label="Toggle path" onClick={onToggle}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="tree-path-icon" style={{ background: path.color }}>
          {path.icon.slice(0, 1)}
        </span>
        <button
          className="tree-title"
          onClick={() => {
            onSelect(path.id);
            if (!open) {
              onToggle();
            }
          }}
        >
          {path.title}
        </button>
        <div className="tree-actions">
          <button
            className="icon-button"
            aria-label="Add topic"
            onClick={() => {
              if (!open) onToggle();
              setAdding(true);
            }}
          >
            <Plus size={14} />
          </button>
          <button className="icon-button" aria-label="Rename path" onClick={rename}>
            <Edit size={14} />
          </button>
          <button className="icon-button" aria-label="Delete path" onClick={removePath}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="tree-children">
          <div className="path-stats-bar">
            <div className="path-stat">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{progress}%</span>
            </div>
            <div className="path-stat">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{learningCount}</span>
            </div>
            <div className="path-stat">
              <span className="stat-label">Interview Ready</span>
              <span className="stat-value">{readyCount}</span>
            </div>
            <div className="path-stat">
              <span className="stat-label">Need Revision</span>
              <span className="stat-value">{revisionCount}</span>
            </div>
            <div className="path-stat">
              <span className="stat-label">Total Topics</span>
              <span className="stat-value">{totalCount}</span>
            </div>
          </div>
          {roots.map((topic) => (
            <TopicNode key={topic.id} topic={topic} allTopics={topics} />
          ))}
          {adding && <TopicForm pathId={path.id} close={() => setAdding(false)} />}
        </div>
      )}
    </div>
  );
}
function TopicNode({ topic, allTopics }: { topic: Topic; allTopics: Topic[] }) {
  const children = allTopics
    .filter((item) => item.parentId === topic.id)
    .sort((a, b) => a.order - b.order);
  const siblings = allTopics
    .filter((item) => item.parentId === topic.parentId)
    .sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(topic.title);
  const saveName = async () => {
    if (name.trim())
      await db.topics.update(topic.id, { title: name.trim(), updatedAt: Date.now() });
    setEditing(false);
  };
  const move = async (direction: -1 | 1) => {
    const index = siblings.findIndex((item) => item.id === topic.id);
    const swap = siblings[index + direction];
    if (!swap) return;
    await db.transaction('rw', db.topics, async () => {
      await db.topics.update(topic.id, { order: swap.order, updatedAt: Date.now() });
      await db.topics.update(swap.id, { order: topic.order, updatedAt: Date.now() });
    });
  };
  const indent = async () => {
    const index = siblings.findIndex((item) => item.id === topic.id);
    const parent = siblings[index - 1];
    if (parent)
      await db.topics.update(topic.id, {
        parentId: parent.id,
        order: allTopics.filter((item) => item.parentId === parent.id).length,
        updatedAt: Date.now(),
      });
  };
  const outdent = async () => {
    if (!topic.parentId) return;
    const parent = allTopics.find((item) => item.id === topic.parentId);
    if (parent)
      await db.topics.update(topic.id, {
        parentId: parent.parentId,
        order: parent.order + 1,
        updatedAt: Date.now(),
      });
  };
  const remove = async () => {
    if (confirm(`Delete “${topic.title}” and its child topics?`)) {
      const descendants = collect(topic.id, allTopics);
      await db.transaction('rw', db.topics, db.notes, db.snippets, db.resources, async () => {
        await db.notes.where('topicId').anyOf(descendants).delete();
        await db.snippets.where('topicId').anyOf(descendants).delete();
        await db.resources.where('topicId').anyOf(descendants).delete();
        await db.topics.bulkDelete(descendants);
      });
    }
  };
  return (
    <div className="topic-node" role="treeitem" aria-expanded={children.length ? open : undefined}>
      <div className="tree-topic">
        {children.length ? (
          <button className="icon-button" aria-label="Toggle topic" onClick={() => setOpen(!open)}>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        ) : (
          <span className="tree-indent" />
        )}
        <span className={`status-dot ${topic.status}`} />
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={saveName}
            onKeyDown={(event) => event.key === 'Enter' && saveName()}
          />
        ) : (
          <Link to={`/topics/${topic.id}`}>{topic.title}</Link>
        )}
        <div className="tree-actions">
          <button
            className="icon-button"
            aria-label="Add child topic"
            onClick={() => {
              setOpen(true);
              setAdding(true);
            }}
          >
            <Plus size={14} />
          </button>
          <button className="icon-button" aria-label="Move up" onClick={() => move(-1)}>
            ↑
          </button>
          <button className="icon-button" aria-label="Move down" onClick={() => move(1)}>
            ↓
          </button>
          <button className="icon-button" aria-label="Nest topic" onClick={indent}>
            <IndentIncrease size={14} />
          </button>
          <button className="icon-button" aria-label="Unnest topic" onClick={outdent}>
            <IndentDecrease size={14} />
          </button>
          <button
            className="icon-button"
            aria-label="Rename topic"
            onClick={() => setEditing(true)}
          >
            <MoreHorizontal size={14} />
          </button>
          <button className="icon-button" aria-label="Delete topic" onClick={remove}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="tree-children">
          {children.map((child) => (
            <TopicNode key={child.id} topic={child} allTopics={allTopics} />
          ))}
          {adding && (
            <TopicForm
              pathId={topic.learningPathId}
              parentId={topic.id}
              close={() => setAdding(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
function TopicForm({
  pathId,
  parentId = null,
  close,
}: {
  pathId: string;
  parentId?: string | null;
  close: () => void;
}) {
  const [title, setTitle] = useState('');
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const siblings = await db.topics.where({ learningPathId: pathId, parentId }).toArray();
    await db.topics.add({
      id: uid(),
      learningPathId: pathId,
      parentId,
      title: title.trim(),
      description: '',
      order: siblings.length,
      status: 'not_started',
      needsRevision: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    close();
  };
  return (
    <form className="tree-form" onSubmit={save}>
      <input
        autoFocus
        placeholder="Topic name"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={() => !title && close()}
      />
      <button aria-label="Save topic">
        <Plus size={14} />
      </button>
    </form>
  );
}
function collect(id: string, topics: Topic[]): string[] {
  return [
    id,
    ...topics
      .filter((topic) => topic.parentId === id)
      .flatMap((topic) => collect(topic.id, topics)),
  ];
}
