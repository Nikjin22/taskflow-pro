import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Menu, X, Shield, Sun, Moon, Ticket, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle, init } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { init(); }, []);

  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(user?.role);
  const isUser = user?.role === "USER";

  const bgPrimary = isDark ? "#0f1117" : "#f4f6fb";
  const sidebarBg = isDark ? "rgba(15,17,23,0.98)" : "white";
  const sidebarBorder = isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(15,17,23,0.85)" : "rgba(255,255,255,0.85)";
  const textMain = isDark ? "white" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const navActive = isDark ? { background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" } : { background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe" };
  const navInactive = isDark ? { color: "rgba(255,255,255,0.4)" } : { color: "#64748b" };
  const navHoverBg = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";
  const toggleBg = isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9";
  const toggleActiveBg = isDark ? "rgba(255,255,255,0.12)" : "white";
  const roleColor = { ADMIN: "#f59e0b", MANAGER: "#6366f1", USER: "#10b981" };
  const roleLabel = { ADMIN: "Administrator", MANAGER: "IT Manager", USER: "Team Member" };

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

  const sidebarContent = (
    <div style={{display: "flex", flexDirection: "column", height: "100%", background: sidebarBg, backdropFilter: "blur(20px)", borderRight: "1px solid " + sidebarBorder}}>
      <div style={{padding: "18px 14px", borderBottom: "1px solid " + sidebarBorder}}>
        <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
          <div style={{width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "white", flexShrink: 0, boxShadow: "0 4px 10px rgba(99,102,241,0.3)"}}>T</div>
          <div style={{flex: 1, minWidth: 0}}>
            <p style={{fontWeight: "700", fontSize: "13px", color: textMain, margin: 0}}>TaskFlow Pro</p>
            <p style={{fontSize: "10px", color: textMuted, margin: 0}}>Workspace</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} style={{background: "none", border: "none", cursor: "pointer", color: textMuted, padding: "2px", display: "flex"}}>
            <X size={15} />
          </button>
        </div>
      </div>

      <nav style={{flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1px"}}>
        <p style={{fontSize: "9px", fontWeight: "700", color: textMuted, textTransform: "uppercase", letterSpacing: "1px", padding: "6px 8px 4px", margin: 0}}>Menu</p>
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              style={{display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "9px", fontSize: "13px", fontWeight: "500", textDecoration: "none", transition: "all 0.15s ease", border: "1px solid transparent",
                ...(isActive ? navActive : navInactive)}}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = navHoverBg; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} style={{flexShrink: 0}} />
              <span style={{flex: 1}}>{label}</span>
              {badge > 0 && <span style={{padding: "1px 6px", borderRadius: "999px", background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "700"}}>{badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div style={{padding: "10px 8px", borderTop: "1px solid " + sidebarBorder}}>
        <div style={{padding: "9px 10px", borderRadius: "9px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: "1px solid " + sidebarBorder, display: "flex", alignItems: "center", gap: "9px"}}>
          <div style={{width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px", color: "white", flexShrink: 0}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <p style={{fontSize: "12px", fontWeight: "600", color: textMain, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{user?.name}</p>
            <p style={{fontSize: "10px", margin: 0, fontWeight: "500", color: roleColor[user?.role] || "#10b981"}}>{roleLabel[user?.role]}</p>
          </div>
          <button onClick={logout} title="Sign out"
            style={{background: "none", border: "none", cursor: "pointer", color: textMuted, padding: "3px", borderRadius: "5px", display: "flex"}}
            onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "#fee2e2"; }}
            onMouseLeave={e => { e.currentTarget.style.color = textMuted; e.currentTarget.style.background = "none"; }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{display: "flex", height: "100vh", overflow: "hidden", background: bgPrimary, transition: "background 0.2s ease"}}>
      {sidebarOpen && <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20, backdropFilter: "blur(4px)"}} className="lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside style={{width: "210px", flexShrink: 0}} className="hidden lg:block">{sidebarContent}</aside>

      {sidebarOpen && (
        <aside style={{position: "fixed", inset: "0 auto 0 0", width: "210px", zIndex: 30}} className="lg:hidden">{sidebarContent}</aside>
      )}

      <div style={{flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden"}}>
        <header style={{height: "52px", display: "flex", alignItems: "center", padding: "0 18px", gap: "10px", flexShrink: 0, background: headerBg, backdropFilter: "blur(20px)", borderBottom: "1px solid " + sidebarBorder}}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}
            style={{background: "none", border: "none", cursor: "pointer", color: textMuted, padding: "5px", borderRadius: "7px", display: "flex"}}>
            <Menu size={17} />
          </button>
          <div style={{flex: 1}} />

          {/* Dark/Light Toggle */}
          <div style={{display: "flex", alignItems: "center", padding: "3px", borderRadius: "8px", background: toggleBg, border: "1px solid " + sidebarBorder, gap: "2px"}}>
            <button onClick={() => isDark && toggle()}
              style={{padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "600", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s",
                background: !isDark ? toggleActiveBg : "transparent",
                color: !isDark ? "#6366f1" : textMuted,
                boxShadow: !isDark ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}}>
              <Sun size={11} /> Light
            </button>
            <button onClick={() => !isDark && toggle()}
              style={{padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "600", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s",
                background: isDark ? toggleActiveBg : "transparent",
                color: isDark ? "#818cf8" : textMuted,
                boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.2)" : "none"}}>
              <Moon size={11} /> Dark
            </button>
          </div>

          {isAdminOrManager && (
            <span style={{padding: "3px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: "700", background: isDark ? "rgba(99,102,241,0.15)" : "#eef2ff", color: "#6366f1", border: "1px solid " + (isDark ? "rgba(99,102,241,0.25)" : "#c7d2fe")}}>
              {user?.role === "ADMIN" ? "Admin" : "Manager"}
            </span>
          )}

          <div style={{display: "flex", alignItems: "center", gap: "7px"}}>
            <div style={{width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", color: "white"}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{fontSize: "13px", fontWeight: "500", color: textMain}} className="hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <main style={{flex: 1, overflow: "auto", padding: "20px"}}>
          <div style={{maxWidth: "1200px", margin: "0 auto"}}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}