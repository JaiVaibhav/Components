import { BookOpen, ChevronLeft, Command, LayoutDashboard, Moon, PanelLeftClose, Search, Settings, Sun, Waypoints } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";

export default function AppShell() {
  const settings = useLiveQuery(() => db.settings.get("user"));
  const setTheme = async () => { if (!settings) return; const theme = settings.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = theme; localStorage.setItem("learning-theme", theme); await db.settings.update("user", { theme }); };
  const toggleSidebar = async () => { if (settings) await db.settings.update("user", { sidebarCollapsed: !settings.sidebarCollapsed }); };
  const collapsed = settings?.sidebarCollapsed;
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className="sidebar"><Link to="/" className="logo"><span><BookOpen size={18} /></span>{!collapsed && "Learning OS"}</Link>
      <nav><NavLink to="/" end><LayoutDashboard size={18}/>{!collapsed && "Dashboard"}</NavLink><NavLink to="/explorer"><Waypoints size={18}/>{!collapsed && "Learning paths"}</NavLink><NavLink to="/settings"><Settings size={18}/>{!collapsed && "Settings"}</NavLink></nav>
      <div className="sidebar-bottom"><button aria-label="Toggle theme" onClick={setTheme}>{settings?.theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>} {!collapsed && "Theme"}</button><button aria-label="Toggle sidebar" onClick={toggleSidebar}>{collapsed ? <PanelLeftClose size={18}/> : <ChevronLeft size={18}/>} {!collapsed && "Collapse"}</button></div>
    </aside><main className="app-content"><header className="topbar"><div className="breadcrumb">Personal workspace <span>/</span> Learning</div><Link className="search-trigger" to="/search"><Search size={17}/><span>Search everything…</span><kbd><Command size={11}/>K</kbd></Link></header><Outlet /></main>
  </div>;
}
