import type { Topic, TopicStatus } from "../models/types";
export const STATUS_WEIGHT: Record<TopicStatus, number> = { not_started: 0, learning: 25, practiced: 60, revised: 85, interview_ready: 100 };
export function leafTopics(topics: Topic[]) { const parents = new Set(topics.filter((topic) => topic.parentId).map((topic) => topic.parentId)); return topics.filter((topic) => !parents.has(topic.id)); }
export function progressOf(topics: Topic[]) { const leaves = leafTopics(topics); return leaves.length ? Math.round(leaves.reduce((sum, topic) => sum + STATUS_WEIGHT[topic.status], 0) / leaves.length) : 0; }
export function pathMatches(path: { targetRoles: string[]; minimumLevel: string; maximumLevel: string }, role: string, level: string, levels: readonly string[]) { const current = levels.indexOf(level); return path.targetRoles.includes(role) && current >= levels.indexOf(path.minimumLevel) && current <= levels.indexOf(path.maximumLevel); }
