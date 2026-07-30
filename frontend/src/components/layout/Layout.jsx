import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Menu, X, Shield, Sun, Moon, Ticket } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

const BRAND = "#6366f1";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(user?.role);
  const isUser = user?.role === "USER";

  const cardBorder = isDark ? "#1e293b" : "#e2e8f0";
  const headerBg = isDark ? "#0f172a" : "white";
  const sidebarBg = isDark ? "#0f172a" : "white";
  const mainBg = isDark ? "#020b18" : "#f8fafc";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const navHover = isDark ? "#1e293b" : "#eef2ff";

  const { data: ticketsData } = useQuery({
    queryKey: ["my-assigned-tickets"],
    queryFn: () => api.get("/tickets/assigned/me").then(r => r.data),
    enabled: isUser,
    refetchInterval: 15000,
    retry: false,
  });

  const assignedTicketsCount = ticketsData?.tickets?.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED").length || 0;

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", show: true },
    { to: "/projects", icon: FolderKanban, label: "Projects", show: true },
    { to: "/tasks", icon: CheckSquare, label: "My Tasks", show: true },
    { to: "/my-tickets", icon: Ticket, label: "My Tickets", show: isUser, badge: assignedTicketsCount },
    { to: "/helpdesk-manage", icon: Ticket, label: "Helpdesk", show: isAdminOrManager },
    { to: "/admin", icon: Shield, label: user?.role === "ADMIN" ? "Admin Panel" : "Manage", show: isAdminOrManager },
    { to: "/settings", icon: Settings, label: "Settings", show: true },
  ].filter(n => n.show);

  const roleLabel = { ADMIN: "Administrator", MANAGER: "IT Manager", USER: "Team Member" };

  return (
    <div className="flex h-screen overflow-hidden" style={{background: mainBg}}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside style={{background: sidebarBg, borderRight: "1px solid " + cardBorder}}
        className={"fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center px-5 h-16 gap-3" style={{borderBottom: "1px solid " + cardBorder}}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{background: BRAND}}>T</div>
          <div>
            <p className="font-bold text-sm" style={{color: textMain}}>TaskFlow Pro</p>
            <p className="text-xs" style={{color: textMuted}}>Project Management</p>
          </div>
          <button className="ml-auto lg:hidden" style={{color: textMuted}} onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3" style={{borderBottom: "1px solid " + cardBorder}}>
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full" style={{background: BRAND}} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{color: BRAND}}>Workspace</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={({ isActive }) => isActive ? { background: BRAND, color: "white" } : { color: textMuted }}
              onMouseEnter={e => { if (!e.currentTarget.getAttribute("aria-current")) e.currentTarget.style.background = navHover; }}
              onMouseLeave={e => { if (!e.currentTarget.getAttribute("aria-current")) e.currentTarget.style.background = "transparent"; }}>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{background: BRAND, minWidth: "18px", textAlign: "center"}}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3" style={{borderTop: "1px solid " + cardBorder}}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl group">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background: BRAND}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{color: textMain}}>{user?.name}</p>
              <p className="text-xs truncate" style={{color: BRAND}}>{roleLabel[user?.role] || "Team Member"}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-red-500" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0" style={{background: headerBg, borderBottom: "1px solid " + cardBorder}}>
          <button className="lg:hidden p-2 rounded-xl" style={{color: textMuted}} onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{background: isDark ? "#1e293b" : "#f8fafc", border: "1px solid " + cardBorder}}>
            <button onClick={toggle} className="p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium px-2"
              style={!isDark ? {background: "white", color: BRAND, boxShadow: "0 1px 3px rgba(0,0,0,0.1)"} : {color: textMuted}}>
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button onClick={toggle} className="p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium px-2"
              style={isDark ? {background: "#334155", color: "#fbbf24", boxShadow: "0 1px 3px rgba(0,0,0,0.3)"} : {color: textMuted}}>
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
          {isAdminOrManager && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{background: BRAND}}>
              {user?.role === "ADMIN" ? "Admin" : "Manager"}
            </span>
          )}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background: BRAND}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{color: textMain}}>{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto" style={{background: mainBg}}>
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}