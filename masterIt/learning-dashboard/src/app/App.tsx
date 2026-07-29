import { Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import AppShell from "../layouts/AppShell";
import Dashboard from "../features/dashboard/Dashboard";
import Explorer from "../features/explorer/Explorer";
import TopicDetail from "../features/topics/TopicDetail";
import Settings from "../features/settings/Settings";
import SearchPage from "../features/search/SearchPage";
const Loading = () => <div className="page-loading">Loading workspace…</div>;
export default function App() { const settings = useLiveQuery(() => db.settings.get("user")); useEffect(() => { const theme = localStorage.getItem("learning-theme") ?? settings?.theme ?? "dark"; document.documentElement.dataset.theme = theme; }, [settings?.theme]); return <Suspense fallback={<Loading/>}><Routes><Route element={<AppShell/>}><Route path="/" element={<Dashboard/>}/><Route path="/explorer" element={<Explorer/>}/><Route path="/topics/:topicId" element={<TopicDetail/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/settings" element={<Settings/>}/></Route></Routes></Suspense>; }
