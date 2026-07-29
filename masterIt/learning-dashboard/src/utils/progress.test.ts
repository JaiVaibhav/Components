import { describe, expect, it } from "vitest";
import type { Topic } from "../models/types";
import { leafTopics, pathMatches, progressOf } from "./progress";

const topic = (id: string, parentId: string | null, status: Topic["status"]): Topic => ({ id, parentId, learningPathId: "path", title: id, description: "", order: 0, status, needsRevision: false, createdAt: 0, updatedAt: 0 });
describe("learning progress", () => {
  it("calculates only actionable leaf topics", () => { const topics = [topic("root", null, "interview_ready"), topic("child-a", "root", "learning"), topic("child-b", "root", "interview_ready")]; expect(leafTopics(topics).map((item) => item.id)).toEqual(["child-a", "child-b"]); expect(progressOf(topics)).toBe(63); });
  it("returns zero when a path has no actionable topics", () => expect(progressOf([])).toBe(0));
  it("matches a path by both role and seniority range", () => { const path = { targetRoles: ["Frontend Engineer"], minimumLevel: "Senior", maximumLevel: "Architect" }; const levels = ["Fresher", "Junior", "Mid", "Senior", "Staff", "Principal", "Architect"] as const; expect(pathMatches(path, "Frontend Engineer", "Staff", levels)).toBe(true); expect(pathMatches(path, "Backend Engineer", "Staff", levels)).toBe(false); expect(pathMatches(path, "Frontend Engineer", "Junior", levels)).toBe(false); });
});
